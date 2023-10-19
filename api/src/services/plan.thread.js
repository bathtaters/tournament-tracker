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
function getBestPlan(schedule, { events, voters, slots, dates, slotCount, daysOff }) {
    let playerLists = schedule.map(() => []),
        rankIdx = voters.map(() => 0)

    // Loop while player list is incomplete
    while (playerLists.some((players, slot) => players.length !== schedule[slot].playercount)) {
        
        // Force players into empty event slots if no one else voted for them
        if (Object.entries(rankIdx).every(([v, rank]) => voters[v].events.length <= rank)) {
            for (const slot in playerLists) {
                while (playerLists[slot].length < schedule[slot].playercount) {

                    const voterIdx = voters.findIndex(({ ignoreSlots }, v) =>
                        !ignoreSlots.includes(slot)
                            && !playerLists[slot].includes(v)
                    )
                    
                    // If no player found, fail the schedule -- I should handle this more gracefully
                    if (voterIdx === -1) return { plan: [], score: NaN }

                    playerLists[slot].push(voterIdx)
                }
            }
            break
        }

        // Give each player their next available top choice on the schedule
        for (const v in voters) {

            while (rankIdx[v] < voters[v].events.length) {

                const eventId = voters[v].events[rankIdx[v]++]
                if (!eventId) continue // Empty ranking
                
                const slot = schedule.findIndex(
                    (event, slot) =>
                        // Ignore slots
                        !voters[v].ignoreSlots.includes(slot)
                            // Find matching event
                            && event?.id === eventId
                            // ...that is not full
                            && playerLists[slot].length < event.playercount
                )
                
                // If an event is found (and player isn't already registered)
                if (slot !== -1 && !playerLists[slot].includes(v)) {
                    // ...register player for that event
                    playerLists[slot].push(v)
                    break
                }
            }
        }   
    }

    // Generate plan data from playerLists
    const day = new Date(dates[0])
    let plan
    try {

        plan = playerLists.map((players, slot) => {
            // Inc. day
            if (slot && slot % slots === 0) day.setDate(day.getDate() + 1)
    
            return {
                id: schedule[slot]?.id,
                day: new Date(day),
                slot: slot % slots + 1,
                score: getEventScores(
                    schedule[slot]?.id,
                    players.map((v) => voters[v]),
                    events.length,
                ),
            }
        })
    } catch (e) {
        console.log(playerLists)
        console.log(voters)
        throw e
    }
    
    return {
        plan,
        score: getPlanScore(plan, slotCount, daysOff, events.length),
    }
}
