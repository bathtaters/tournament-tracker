const { parentPort } = require("worker_threads")
const { getEventScores, getPlanScore } = require("../utils/plan.utils")
const { combinationCount, getCombinationN, getArrayCombos } = require("../utils/combination.utils")

/** Process worker for multithreading -- value is schedule, extra is all other data */
parentPort.on('message', ({ value, extra }) => {
    const bestScore = getBestPlan(value, extra)
    parentPort.postMessage(bestScore)
    parentPort.close()
})


/** Get best plan for a given schedule */
function getBestPlan(schedule, { events, availableVoters, slots, dates, slotCount, daysOff }) {
    let bestPlan = { plan: [], score: NaN }

    // Determine every possible player combo for each slot in the schedule
    const comboMax = schedule.map((event, slot) => combinationCount(
        availableVoters[Math.trunc(slot / slots)].length,
        event?.playercount
    ))
    
    for (const n of getArrayCombos(comboMax)) {
        const plan = getPlanN(n, schedule, availableVoters, dates[0], slots, comboMax, events.length)
        if (!plan) continue
        
        // Score each combination and update max scores
        const score = getPlanScore(plan, slotCount, daysOff, events.length)

        if (isNaN(bestPlan.score) || bestPlan.score < score) {
            bestPlan.plan = plan
            bestPlan.score = score
        }
    }

    return bestPlan
}


/** Retrieve next combination of players for a given game
 *  Returns NULL when no combination exisits */
function getPlanN(n, schedule, availableVoters, startDay, slots, comboMax, eventCount) {
    let plan = [], day = new Date(startDay)
        
    for (let slot = 0; slot < n.length; ++slot % slots === 0 && day.setDate(day.getDate() + 1)) {
        if (!comboMax[slot]) continue  // Skip missing event days

        const players = getCombinationN(
            n[slot],
            availableVoters[Math.trunc(slot / slots)],
            schedule[slot].playercount,
            comboMax[slot]
        )

        plan.push({
            id: schedule[slot]?.id,
            day: new Date(day),
            slot: slot % slots + 1,
            score: getEventScores(schedule[slot]?.id, players, eventCount),
        })
    }
    return plan.length ? plan : null
}
