const { datesAreEqual, dayCount } = require("./shared.utils")

/** Remove events no one voted for */
const filterUnvoted = (events, voters) => {
    let votedEvents = new Set()
    voters.forEach(({ events }) => events.forEach((id) => votedEvents.add(id)))
    return events.filter(({ id }) => votedEvents.has(id))
}

/** Returns filter cb to determine if voter can participate in event */
const voterCanPlay = (day) => {
    return ({ days }) => !Array.isArray(days) || days.every((d) => !datesAreEqual(d,day))
}

/** Calculate how many days each player is present for the entire duration,
 *  return object w/ playerIds as keys */
function daysPresentByPlayer([startDate, endDate], voters) {
    let daysPresent = {}
    const totalDays = dayCount(startDate, endDate)

    for (const { id, days } of voters) {
        let count = 0
        for (const day of days) {
            if (day >= startDate && day <= endDate) count++
        }

        daysPresent[id] = totalDays - count
    }
    return daysPresent
}

/** Return { playerid: score_for_event }, higher score = event is higher on player's list */
const getEventScores = (event, voters, eventCount) => voters.reduce((scores, voter) => {
    const idx = voter.events.indexOf(event.id)
    if (idx === -1) return { ...scores, [voter.id]: 0 }
    return { ...scores, [voter.id]: eventCount - idx }
}, {})

/** Sum all player scores from a given plan [{ scores: { [id]: score, ... } }, ...] */
const getTotalScore = (plan) => plan.reduce((total, slot) => 
    Object.values(slot.scores).reduce((sum, score) => sum + score, 0) + total,
    0
)

/** Count how many games each individual player is in */
const getPlayerCounts = (plan) => plan.reduce((players, slot) => 
    Object.keys(slot.scores).reduce((scores, id) => ({
        ...scores,
        [id]: id in scores ? scores[id] + 1 : 1
    }), players),
    {}
)

/** Sum each individual player scores from a given plan [{ scores: { [id]: score, ... } }, ...] */
const getPlayerTotals = (plan) => plan.reduce((players, slot) => 
    Object.entries(slot.scores).reduce((scores, [ id, score ]) => ({
        ...scores,
        [id]: id in scores ? scores[id] + score : score
    }), players),
    {}
)

/** Calculate the largest deviation between player scores of a given plan [{ scores: { [id]: score, ... } }, ...] */
const getDeviation = (plan, daysPresent) => {
    const scores = getPlayerTotals(plan)

    let max = NaN, min = NaN
    Object.entries(daysPresent).forEach(([id, factor]) => {
        const score = (scores[id] || 0) - factor
        if (isNaN(max) || score > max) max = score
        if (isNaN(min) || score < min) min = score
    })
    return max - min
}

/** Calculate the deviation between the weighted max & min game counts */
const getGameCount = (plan, daysPresent) => {
    const scores = getPlayerCounts(plan)

    // Weight game counts & find min/max
    let max = NaN, min = NaN
    Object.entries(daysPresent).forEach(([id, factor]) => {
        const score = id in scores ? scores[id] / factor : 0
        if (isNaN(max) || score > max) max = score
        if (isNaN(min) || score < min) min = score
    })
    return max - min
}

/** Map plan data to event data for updating */
const planToEvent = ({ id, day, slot, scores }) => ({
    id, slot,
    day: day.toISOString().slice(0,10),
    players: Object.keys(scores),
})

/** Map event ID to a cleared event */
const resetEvent = (id) => ({
    id,
    slot: 0,
    day: null,
    players: [],
})


module.exports = {
    filterUnvoted, voterCanPlay, daysPresentByPlayer,
    getEventScores, getTotalScore, getDeviation, getGameCount,
    planToEvent, resetEvent,
}