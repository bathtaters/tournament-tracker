/** One day in ms */
const oneDay = 24 * 60 * 60 * 1000
/** Get the number of days from date A to date B inclusive */
const dayCount = (dateA, dateB) => 1 + (dateB - dateA) / oneDay

/** Remove events no one voted for */
const filterUnvoted = (events, voters) => {
    let votedEvents = new Set()
    voters.forEach(({ events }) => events.forEach((id) => votedEvents.add(id)))
    return events.filter(({ id }) => votedEvents.has(id))
}

/** Returns filter cb to determine if voter can participate in event  */
const voterCanPlay = (day) => {
    const dayStr = day.toISOString().slice(0,10)
    return ({ days }) => !Array.isArray(days) || days.every((d) => d !== dayStr)
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

/** Sum each individual player scores from a given plan [{ scores: { [id]: score, ... } }, ...] */
const getPlayerTotals = (plan) => plan.reduce((players, slot) => 
    Object.entries(slot.scores).reduce((scores, [ id, score ]) => ({
        ...scores,
        [id]: id in scores ? scores[id] + score : score
    }), players),
    {}
)

/** Calculate the largest deviation between player scores of a given plan [{ scores: { [id]: score, ... } }, ...] */
const getDeviation = (plan) => {
    const scores = getPlayerTotals(plan)

    let max = NaN, min = NaN
    Object.values(scores).forEach((score) => {
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
    dayCount, filterUnvoted, voterCanPlay,
    getEventScores, getTotalScore, getDeviation,
    planToEvent, resetEvent,
}