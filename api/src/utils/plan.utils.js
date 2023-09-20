const { datesAreEqual } = require("./shared.utils")

// SETTINGS \\

// How many off days = 1 active day (To equalize events for players who can;t make it)
const daysOffFactor = 2

// List of multipliers & getScore functions
// getScore = ({ plan, slotCount, eventCount, daysOff }) => number
// Higher number = more likely to select
const planMetrics = [
    { factor: 10, getScore: getTotalScore }, // Total of Player Scores
    { factor:  3, getScore: getDeviation  }, // Score Deviation by Player
    { factor:  7, getScore: getGameCount  }, // Games per Player
]


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
function daysOffByPlayer([startDate, endDate], voters) {
    return voters.reduce(
        (daysOff, { id, days }) => ({
            ...daysOff,
            [id]: days
                .filter((day) => day >= startDate && day <= endDate)
                .length / daysOffFactor
        }),
        {}
    )
}

/** Return { playerid: score_for_event }, higher score = event is higher on player's list */
const getEventScores = (event, voters, eventCount) => voters.reduce((scores, voter) => {
    const idx = voter.events.indexOf(event.id)
    if (idx === -1) return { ...scores, [voter.id]: 0 }
    return { ...scores, [voter.id]: eventCount - idx }
}, {})

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

/** Sum all player scores from a given plan [{ scores: { [id]: score, ... } }, ...] */
function getTotalScore({ plan }) {
    return plan.reduce((total, slot) => 
        Object.values(slot.scores).reduce((sum, score) => sum + score, 0) + total,
        0
    )
}

/** Calculate the largest deviation between player scores of a given plan [{ scores: { [id]: score, ... } }, ...] */
function getDeviation({ plan, slotCount, eventCount, daysOff }) {
    const scores = getPlayerTotals(plan)

    let max = NaN, min = NaN
    Object.entries(daysOff).forEach(([id, dayCount]) => {
        const score = id in scores ? scores[id] + dayCount * eventCount : 0
        if (isNaN(max) || score > max) max = score
        if (isNaN(min) || score < min) min = score
    })
    return (slotCount * eventCount) - max + min
}

/** Calculate the deviation between the weighted max & min game counts */
function getGameCount({ plan, slotCount, daysOff }) {
    const scores = getPlayerCounts(plan)

    // Weight game counts & find min/max
    let max = NaN, min = NaN
    Object.entries(daysOff).forEach(([id, dayCount]) => {
        const score = id in scores ? scores[id] + dayCount : 0
        if (isNaN(max) || score > max) max = score
        if (isNaN(min) || score < min) min = score
    })
    return slotCount - max + min
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

/** Convert planMetrics + planData into a single score */
const getPlanScore = (planData) => planMetrics.reduce(
    (score, { factor, getScore }) => score + factor * getScore(planData),
    0
)

module.exports = {
    filterUnvoted, voterCanPlay, daysOffByPlayer,
    getEventScores, getPlanScore,
    planToEvent, resetEvent,
}