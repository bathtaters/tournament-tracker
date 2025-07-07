const { parentPort } = require("worker_threads")
const logger = require("../utils/log.adapter")
const { getDayCount, midOut, customMax, shuffle } = require("../utils/shared.utils")
const { multiset } = require("../db/models/plan")
const { batchSet: setSetting, get: getSetting } = require('../db/models/settings')
const { toObjArray, asType } = require("./settings.services")
const { abort, isActive } = require("../utils/multithread.utils")
const { filterUnvoted, getVoterSlots, resetEvent, planStatus, getEventScores, slotToEvent } = require("../utils/plan.utils")
const { planId } = require("../config/meta")

/* Export for spawning this file as a Worker thread -- Args = [events, voters, settings], Req = simpleReq(req) */
if (parentPort) {
    require('../db/admin/connect').openConnection(); // Ensure that DB has been loaded

    parentPort.on('message', async ({ args, req }) => {
        try {
            // Run processor-intensive plan generator
            const planData = await generatePlan(...args)
                .then((data) => data?.filter(({ id }) => id))
    
            // Update DB with result
            if (planData != null) {
                await multiset(planData, req)
                await setSetting(planStatus(4, 100), req)
            }
        } catch (err) {
            await setSetting(planStatus(2), req)
            logger.error('Plan generator failed in genPlanAsync:', err)
            throw err
        }
        parentPort.close()
    })
    
    parentPort.on('close', () => {
        if (isActive(planId)) logger.error('Plan thread terminated early', planId)
        return cancelPlan()
    })
    parentPort.on('messageerror', (err) => {
        logger.error('Plan thread terminated due to error', planId, err)
        return cancelPlan()
    })
}

const preferenceWeight = 1, balanceWeight = 4

/** Algorithmic plan generator
 * 
 * May be triggered as a spawned thread providing data object = `{ args: [events, voters, settings], req?: simpleRequest }`
 * @param {{ id: string, playercount: number }[]} events - List of events in plan
 * @param {{ id: string, events: string[], ignoreSlots: number[] }[]} voters - List of voters and their votes
 * @param {{ plandates?: [string, string], planslots?: number, datestart: string, dateend: string, dayslots: number }} settings - Plan settings
 * @returns {Promise<{ id: string, players: string[], slot: number, day: string }[]>} - Event update data
 */
async function generatePlan(events, voters, settings = {}) {
    // Initialize variables
    const slotsPerDay = settings.planslots ?? settings.dayslots,
        dates = [
            new Date(`${settings.plandates?.[0] || settings.datestart} `),
            new Date(`${settings.plandates?.[1] || settings.dateend} `)
        ]

    // Error check UI
    if (!events?.length || !voters?.length || isNaN(dates[0]) || isNaN(dates[1]) || slotsPerDay == null)
        throw new Error("Insufficient data to generate a plan (Check players, events and date/slot settings).")
    if (events.some(({ playercount }) => !playercount))
        throw new Error("Invalid event player count: Must be at least 1")

    await updateProg(0, 100)

    // Calculate initial data, build empty schedule array
    const dayCount = getDayCount(...dates)
    const slotCount = slotsPerDay * dayCount
    if (!slotCount) throw new Error("No available slots in schedule")
    /** All possible event options by slot @type {{ id: string, players: string[], score: number }[][]} */
    const possibleEvents = Array(slotCount).fill().map(() => [])
    /** Selected events by slot @type {{ id: string, players: string[], score: number }[] | null[]} */
    const schedule = Array(slotCount).fill(null)

    // Randomize voters array to allow settling tiebreakers using array position
    voters = shuffle(voters)

    // Get voter availability -- sort by most available
    voters = getVoterSlots(voters, slotsPerDay, dates[0]) // Add ignoreSlots field to each voter
    voters.sort((a, b) => a.ignoreSlots.length - b.ignoreSlots.length)
    const maxAvailability = voters.length * slotCount
    /** Data on voter @type {{ [voterId: string]: { ignoreSlots: number[], participateRatio: number, targetEvents: number, slots: number[] } }} */
    const voterData = voters.reduce(
        (avail, { id, ignoreSlots }) => ({
            ...avail,
            [id]: {
                slots: [],
                ignoreSlots,
                participateRatio: (slotCount - ignoreSlots.length) / maxAvailability,
            },
        }), {}
    )
    
    // Get event scores
    const allEvents = events.map(({ id }) => id)
    events = filterUnvoted(events, voters)
    if (!events.length) throw new Error("No events have been voted for")
    const maxEventScore = events.length
    /** Event scores for each voter @type {{ [eventId: string]: { _total: number, _size: number, [voterId: string]: number } }} */
    const eventPrefs = events.reduce(
        (prefs, { id, playercount }) => ({
            ...prefs,
            [id]: { ...getEventScores(id, voters, maxEventScore, true), _size: playercount }
        }),
        {},
    )
    const orderedEvents = Object.keys(eventPrefs).sort((a, b) => eventPrefs[b]._total - eventPrefs[a]._total)

    await updateProg(5, 100)
    
    // Iterate over events, from most to least popular, finding best configurations for each slot
    for (const eventId of orderedEvents) {
        const size = eventPrefs[eventId]._size
        if (voters.length < size) continue // Not enough players

        const orderedVoters = voters.map(({ id }) => id).sort(
            (a, b) => eventPrefs[eventId][b] - eventPrefs[eventId][a]
        )

        // Add event to each possible slot
        possibleEvents.forEach((slot, index) => {
            let players = orderedVoters.filter(
                (id) => !voterData[id].ignoreSlots.includes(index)
            )
            if (players.length < size) return; // Not enough players
            players = players.slice(0, size)
            
            const score = players.reduce((score, id) => score + eventPrefs[eventId][id], 0)
            slot.push({ id: eventId, players, score })
        })
    }

    await updateProg(15, 100)

    // Find best possible game for each slot, starting in the middle
    const scheduled = new Set()
    for (let slot = 0; slot < slotsPerDay; slot++) {
        // Iterate from slot 1 of middle day to last/first day, then slot 2 of middle day...
        for (const day of midOut(dayCount)) {
            const idx = day * slotsPerDay + slot
            
            const bestEvent = customMax(
                possibleEvents[idx],
                ({ id, score }) => scheduled.has(id) ? null : score,
            )
            if (!bestEvent) continue

            // Assigned the highest scored, unscheduled event
            schedule[idx] = bestEvent
            scheduled.add(bestEvent.id)
            bestEvent.players.forEach((id) => voterData[id].slots.push(idx))
        }
    }

    await updateProg(25, 100)

    // Set target event counts by player
    const eventCount = schedule.filter(Boolean).length
    Object.values(voterData).forEach((voter) => {
        voter.targetEvents = voter.participateRatio * eventCount
    })
    
    let adjustTotal = lastTotal = null
    const oneEvent = 1 / eventCount,    // value of 1 event after weighting
        halfEvent = 1 / eventCount / 2  // value of 0.5 events after weighting
    do {
        lastTotal = adjustTotal

        /** Adjustment rating by voter @type {{ [voterId: string]: number }} */
        const adjustVoters = {}
        // Get number of events player wants to join/leave
        Object.entries(voterData).forEach(([id, { targetEvents }]) => {
            adjustVoters[id] = (targetEvents - voterData[id].slots.length) / eventCount
        })

        for (const id in adjustVoters) {
            const isPos = adjustVoters[id] > halfEvent ? true :
                adjustVoters[id] < -halfEvent ? false : null
            if (isPos == null) continue // Less than 1 event off

            let swapSlot, swapVoter, swapValue
            // Check all voters for best swap
            for (const swapId in adjustVoters) {
                // Assign add/rmv voters
                const addVoter = isPos ? id : swapId,
                    rmvVoter = isPos ? swapId : id

                if (swapId === id || adjustVoters[rmvVoter] >= adjustVoters[addVoter] - halfEvent) continue

                // Check all of swapper's events for the best match
                for (const slot of voterData[rmvVoter].slots) {
                    // Skip if voter is already in, or is not available for event
                    if (voterData[addVoter].ignoreSlots.includes(slot)) continue
                    if (!schedule[slot] || schedule[slot].players.includes(addVoter)) continue
                    // Find ID with largest preference differential
                    const prefs = eventPrefs[schedule[slot].id]

                    // Create player 'scores': eventRating (prefs) & enrollCount (adjust)
                    //  - prefs = -0.5: did not vote, 1.0: top rank
                    //  - adjust = -1.0: enrolled in all events, 1.0 enrolled in none
                    const diffScore = (
                        (prefs[addVoter] - prefs[rmvVoter]) * preferenceWeight +
                        (adjustVoters[addVoter] - adjustVoters[rmvVoter]) * balanceWeight
                    )
                    if (swapValue != null && diffScore <= swapValue) continue
                    // New max values
                    swapSlot = slot
                    swapVoter = swapId
                    swapValue = diffScore
                }
            }

            if (swapValue == null) continue // No match found
            
            // Replace player in all locations
            const addVoter = isPos ? id : swapVoter,
                rmvVoter = isPos ? swapVoter : id
            // Replace in event.players
            schedule[swapSlot].players[schedule[swapSlot].players.indexOf(rmvVoter)] = addVoter
            // Move voter slot
            voterData[rmvVoter].slots.splice(voterData[rmvVoter].slots.indexOf(swapSlot), 1)
            voterData[addVoter].slots.push(swapSlot)
            // Update local counters
            adjustVoters[rmvVoter] += oneEvent
            adjustVoters[addVoter] -= oneEvent
        }
        // Calculate final total (after all adjustments)
        adjustTotal = Object.values(adjustVoters).reduce((sum, adj) => sum + Math.abs(adj), 0)
        await updateProg(25 + ((eventCount - (adjustTotal / oneEvent)) / eventCount) * 70, 100)

    // Ensure that total is lowering and has not yet reached 0, otherwise quit
    } while (adjustTotal > oneEvent && (lastTotal == null || adjustTotal < lastTotal))

    await updateProg(95, 100)
    
    // Build arrays of "event" update data
    const addEvents = schedule.filter(Boolean).map((slot, idx) => slotToEvent(slot, idx, slotsPerDay, dates[0]))
    const rmvEvents = allEvents.filter((evId) => addEvents.every(({ id }) => id !== evId)).map(resetEvent)
    return addEvents.concat(rmvEvents)
}


// HELPERS \\

/** Cancel all threads */
const cancelPlan = async () => {
    if (isActive(planId))
        return abort(planId).then(() => true).catch(() => false)
    return false
}

async function updateProg(prog, total) {
    await setSetting(toObjArray({ planprogress: 100 * prog / total }), null)
    const status = await getSetting('planstatus').then(asType)
    if (status !== 3) return cancelPlan().then(() => {
        if (prog < total) logger.log("Plan generation cancelled early.")
    })
}

module.exports = { generatePlan, cancelPlan }