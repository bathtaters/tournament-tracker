const { dayCount, filterUnvoted, voterCanPlay, getEventScores, getTotalScore, getDeviation, planToEvent, resetEvent } = require("../utils/plan.utils")
const { permutationCount, getPermutations, combinationCount, getCombinations, getObjectCombos } = require("../utils/combination.utils")

// How often to update progress (ie. 0.01 = Every 1% increase)
const progUpdate = 0.10

// Default update function -- TODO: Change this to a DB update
const defaultUpdate = (prog, total) => console.info(` ${Math.round(100 * prog / total)}%: ${prog} of ${total} schedules checked`)

// Accepts planEvents, voters & settings, returns event array ({ id, day, slot, players })
async function generatePlan(events, voters, settings = {}, forceEmpties = false, updateProg = defaultUpdate) {
    // Initialize variables
    let bestPlan = { maxScore: { points: NaN }, minDev: { points: NaN } }
    const slots = settings.planslots ?? settings.dayslots,
        dates = [
            new Date(`${settings.plandates?.[0] || settings.datestart} `),
            new Date(`${settings.plandates?.[1] || settings.dateend} `)
        ]
    

    // Error check UI
    if (!events?.length || !voters?.length || isNaN(dates[0]) || isNaN(dates[1]) || slots == null)
        throw new Error("Insufficient data to generate a plan (Check players, events and date/slot settings).")
    if (events.some(({ playercount }) => !playercount))
        throw new Error("Invalid event player count: Must be at least 1")

    const slotCount = slots * dayCount(...dates)
    if (!slotCount) throw new Error("No available slots in schedule")

    let remainingEvents = events.map(({ id }) => id)
    events = filterUnvoted(events, voters)
    if (!events.length) throw new Error("No events have been voted for")


    // Initialize progress bar
    const progTotal = permutationCount(events.length, slotCount, forceEmpties || events.length < slotCount)
    const progInt = progTotal * progUpdate
    let prog = 0, nextProg = progInt
    console.debug(`Checking ${progTotal} schedules, ${slotCount} slots long, with ${events.length} events & ${voters.length} voters...`)
    

    // Determine every possible schedule given the events and slots
    for (const schedule of getPermutations(events, slotCount, forceEmpties || events.length < slotCount)) {
        
        // Write out progress bar updates
        if (prog++ >= nextProg) {
            updateProg(prog, progTotal)
            nextProg += progInt
        }
        
        // Determine every possible player combo for each slot in the schedule
        const slotScores = getSlotScores(schedule, voters, dates[0], slots, events.length)
        if (!slotScores) continue
        
        // Score each combination and update max scores
        for (const plan of getObjectCombos(slotScores, 'scores')) {
            updateMaxScore(plan, bestPlan.maxScore)
            updateMinDev(plan, bestPlan.minDev)
        }
    }
    updateProg(progTotal, progTotal)

    // Handle no matches found
    if (isNaN(bestPlan.maxScore.points) || isNaN(bestPlan.minDev.points)) {
        if (forceEmpties || events.length < slotCount)
            throw new Error("No valid plans were found, check that there are enough players")

        console.debug("No matches found, checking partial schedules")
        return generatePlan(events, voters, settings, true, updateProg)
    }

    // Select plan & reset data for remaining events
    const plan = bestPlan.maxScore.plan // TODO: Get from settings

    remainingEvents = remainingEvents.filter((event) => !plan.some(({ id }) => event === id))

    return plan.map(planToEvent).concat(remainingEvents.map(resetEvent))
}


// HELPERS \\

/** Get score, updating maxScore in the process */
function updateMaxScore(plan, maxScore) {
    const score = getTotalScore(plan)

    if (isNaN(maxScore.points) || maxScore.points < score) {
        maxScore.points = score
        maxScore.plan = [...plan]
    }
}
/** Get score, updating minDev in the process */
function updateMinDev(plan, minDev) {
    const score = getDeviation(plan)

    if (isNaN(minDev.points) || minDev.points > score) {
        minDev.points = score
        minDev.plan = [...plan]
    }
}

/** Retrieve every possible combination of players for a given game
 *  Returns NULL when no combination exisits */
function getSlotScores(schedule, voters, startDay, slots, maxScore) {
    let slotScores = [], day = new Date(startDay)
        
    for (let slot = 0; slot < schedule.length; ++slot % slots === 0 && day.setDate(day.getDate() + 1)) {
        if (!schedule[slot]) continue  // Skip missing event days

        const available = voters.filter(voterCanPlay(day))
        if (!combinationCount(available.length, schedule[slot].playercount))
            return null // Void schedule if no possible combination of players exists

        let newScore = {
            id: schedule[slot]?.id,
            day: new Date(day),
            slot: slot % slots + 1,
            scores: [],
        }
        
        // Determine every possible player combination for available players
        for (const players of getCombinations(available, schedule[slot].playercount)) {
            newScore.scores.push(
                getEventScores(schedule[slot], players, maxScore)
            )
        }

        slotScores.push(newScore)
    }
    return slotScores.length ? slotScores : null
}


module.exports = generatePlan