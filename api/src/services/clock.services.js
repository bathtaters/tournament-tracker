const { toInterval, toMs } = require('../utils/clock.utils')

// Get State of event clock -- [0: stopped, 1: running, 2: paused, 3: ended]
const getState = ({ clockstart, clockmod }, end = Number.POSITIVE_INFINITY, remaining = null) =>
    clockstart !== null ? (end < new Date() ? 3 : 1) :
    clockmod === null ? 0 : remaining ? 2 : 3

// Get time remaining on paused event clock
// WARNING!! Doesn't work on running clock
const getRemaining = ({ clockmod, clocklimit }) => clockmod &&
    toInterval(toMs(clocklimit) - toMs(clockmod))

// Get time ending timestamp of event clock
// WARNING!! Only works on a running gameclock
const getEnd = ({ clockstart, clockmod, clocklimit }) =>  clockstart &&
    new Date(clockstart.getTime() - toMs(clockmod) + toMs(clocklimit))

// Return clock correctly formatted for API 
const calcClock = (clock) => {
    if (Array.isArray(clock)) clock = clock[0]
    if (!clock) throw new Error("Event not found")
    
    const end = getEnd(clock) // Only if running
    const remaining = end ? null : getRemaining(clock) // Only if paused
    return {
        id: clock.id,
        state: getState(clock, end, remaining),
        limit: clock.clocklimit,
        remaining,
        end,
    }
}

module.exports = { calcClock, getEnd, getRemaining, getState }
