const logger = require("../utils/log.adapter")
const { dayCount } = require("../utils/shared.utils")
const { filterUnvoted, voterCanPlay, getEventScores, planToEvent, resetEvent, daysOffByPlayer, getPlanScore, progUpdatePercent } = require("../utils/plan.utils")
const { permutationCount, getPermutations, combinationCount, getCombinationN, getObjectCombos } = require("../utils/combination.utils")


// Accepts planEvents, voters & settings, returns event array ({ id, day, slot, players })
async function generatePlan(events, voters, settings = {}, updateProg, forceEmpties = false) {
    // Initialize variables
    let bestPlan = { plan: [], score: NaN }
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
    
    // Calculate initial data
    const slotCount = slots * dayCount(...dates)
    if (!slotCount) throw new Error("No available slots in schedule")

    let remainingEvents = events.map(({ id }) => id)
    events = filterUnvoted(events, voters)
    if (!events.length) throw new Error("No events have been voted for")
    
    let daysOff = daysOffByPlayer(dates, voters)

    // Initialize progress bar
    const progTotal = permutationCount(events.length, slotCount, forceEmpties || events.length < slotCount)
    const progInt = progTotal * progUpdatePercent
    let prog = 0, nextProg = progInt
    

    // Determine every possible schedule given the events and slots
    for (const schedule of getPermutations(events, slotCount, forceEmpties || events.length < slotCount)) {
        
        // Write out progress bar updates
        if (prog++ >= nextProg) {
            if (updateProg) await updateProg(prog, progTotal)
            nextProg += progInt
        }
        
        // Determine every possible player combo for each slot in the schedule
        const slotScores = getSlotScores(schedule, voters, dates[0], slots, events.length)
        if (!slotScores) continue
        
        // Score each combination and update max scores
        for (const plan of getObjectCombos(slotScores, 'scores')) {
            const score = getPlanScore({
                plan, slotCount, daysOff,
                eventCount: events.length
            })

            if (isNaN(bestPlan.score) || bestPlan.score < score) {
                bestPlan.plan = [...plan]
                bestPlan.score = score
            }
        }
    }
    if (updateProg) await updateProg(progTotal, progTotal)

    // Handle no matches found
    if (isNaN(bestPlan.score)) {
        if (forceEmpties || events.length < slotCount)
            throw new Error("No valid plans were found, check that there are enough players")

        logger.debug("No matches found, checking partial schedules")
        return generatePlan(events, voters, settings, updateProg, true)
    }

    // Select plan & reset data for remaining events
    remainingEvents = remainingEvents.filter(
        (event) => !bestPlan.plan.some(({ id }) => event === id)
    )
    return bestPlan.plan.map(planToEvent).concat(remainingEvents.map(resetEvent))
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
        const combos = combinationCount(available.length, schedule[slot].playercount)
        for (let n = 0; n < combos; n++) {
            newScore.scores.push(
                getEventScores(
                    schedule[slot],
                    getCombinationN(n, available, schedule[slot].playercount, combos),
                    maxScore
                )
            )
        }

        slotScores.push(newScore)
    }
    return slotScores.length ? slotScores : null
}


module.exports = generatePlan