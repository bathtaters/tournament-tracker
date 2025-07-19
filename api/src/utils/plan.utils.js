const { toDateStr, getDayCount } = require("./shared.utils")
const { toObjArray } = require("../services/settings.services")

// SETTINGS \\

// How many unranked events will negate a top ranked event (To prevent players in events they don't rank)
const unrankedEventFactor = 2

/** Convert status number into Settings object array */
const planStatus = (planstatus, planprogress) => toObjArray(planprogress == null ? { planstatus } : { planstatus, planprogress })

/** Remove events no one voted for, or that are too large */
const filterUnvoted = (events, voters) => {
    let votedEvents = new Set()
    const voterCount = voters.length
    voters.forEach(({ events }) => events.forEach((id) => votedEvents.add(id)))
    return events.filter(({ id, playercount = 0 }) => votedEvents.has(id) && voterCount >= playercount)
}

/** Return { playerid: score_for_event, ..., _total: total_score_for_event },
 *  higher score = event is higher on player's list. */
const getEventScores = (eventId, voters, eventCount, weighted = false) => {
    const scores = {}
    let total = 0
    for (const voter of voters) {
        const idx = voter.events.indexOf(eventId)
        const score = idx === -1 ? -Math.trunc(eventCount / unrankedEventFactor) : eventCount - idx
        scores[voter.id] = score
        total += score
    }
    scores._total = total

    if (weighted) {
        scores._total /= eventCount * voters.length
        Object.keys(scores).forEach((id) => {
            if (id !== '_total')
                scores[id] = scores[id] < 0 ? -unrankedEventFactor : scores[id] / eventCount
        })
    }
    return scores
}

/**
 * Map plan data to event data for updating
 * @param {{ id: string, players: string[] }} slot - Slot data from schedule
 * @param {number} index - Slot index
 * @param {number} slotsPerDay - Number of event slots in each day
 * @param {Date} startDate - First day of plan
 * @returns {{ id: string, players: string[], slot: number, day: string }} - Event update data
 */
const slotToEvent = ({ id, players }, index, slotsPerDay, startDate) => {
    const day = new Date(startDate)
    day.setDate(day.getDate() + Math.floor(index / slotsPerDay))
    return {
        id,
        day: toDateStr(day),
        slot: index % slotsPerDay + 1,
        players,
    }
}

/**
 * Map event ID to a cleared event
 * @param {string} id - Event ID
 * @returns {{ id: string, players: string[], slot: number, day: string }} - Blank event update data
 */
const resetEvent = (id) => ({
    id,
    day: null,
    slot: 0,
    players: [],
})

/** Convert voter days to ignore into slot numbers to ignore */
const getVoterSlots = (voters, slotsPerDay, startDate) => {
    
    const dayToSlots = (day) => {
        const startSlot = slotsPerDay * (getDayCount(startDate, day) - 1)
        return Array.from({ length: slotsPerDay }).map((_,i) => i + startSlot)
    }

    return voters.map((voter) => ({
        ...voter,
        ignoreSlots: voter.days.flatMap(dayToSlots)
    }))
}


module.exports = {
    planStatus, filterUnvoted,
    getEventScores, slotToEvent,
    resetEvent, getVoterSlots, 
    _unrankedEventFactor: unrankedEventFactor // For tests
}