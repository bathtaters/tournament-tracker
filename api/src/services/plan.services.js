
// Accepts planEvents, voters & settings, returns event array ({ id, day, slot, players })
function generatePlan(events, voters, { plandates, planslots, datestart, dateend, dayslots } = {}) {
    const dates = [ new Date(plandates?.[0] || datestart), new Date(plandates?.[1] || dateend) ],
        slots = planslots == null ? dayslots : planslots
    
    if (!events?.length || !voters?.length || isNaN(dates[0]) || isNaN(dates[1]) || slots == null)
        throw new Error("Insufficient data to generate a plan (Check players, events and date/slot settings).")

    // TEMP ALGORITHM
    console.warn('Using Temp Algorithm!')
    let day = dates[0], plan = []
    for (let idx = 0; idx < events.length; idx++) {

        plan.push({
            id: events[idx].id,
            day: day > dates[1] ? null : day.toISOString().slice(0,10),
            slot: slots && day <= dates[1] ? idx % slots + 1 : 0,
            players: voters.map(({ id }) => id).slice(0, events[idx].playercount)
        })

        day.setDate(day.getDate() + 1)
    }

    return plan
}

module.exports = generatePlan