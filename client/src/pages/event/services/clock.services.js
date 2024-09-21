import { useEffect, useState } from "react"
import { clockFrequency } from "../../../assets/config"

/**
 * Return clock polling interval based on Event and Clock states.
 * @param {int} [clockState] - [0: stopped, 1: running, 2: paused]
 * @param {int} [eventStatus] - [0: N/A, 1: Pre-Event, 2: Active, 3: Complete]
 * @returns {int} - Polling interval (Based on config.clockApiPollMs) in milliseconds.
 */
export const clockPoll = (clockState, eventStatus = 2) => eventStatus !== 2 ? 0 :
    clockState ? clockFrequency.fastPoll : clockFrequency.slowPoll
 
/**
 * Return clock correctly formatted for API
 * @param {ClockData} clock - Clock data
 * @returns {{ id: string, state: int, limit: Interval, remaining?: Interval, end?: Date }}
 */
export function calcClock(clock) {
    if (clock.clockstart) clock.clockstart = new Date(clock.clockstart)
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

/**
 * React Hook to update Timer state
 * @param {Date} [endDate] 
 * @param {Interval} [remaining] 
 * @returns {null | [string, string] | [string, string, string]} - Time array ([mm, ss] | [hh, mm, ss])
 */
export function useTimer(endDate, remaining) {
    const [timer, setTimer] = useState(null)

    useEffect(() => {
        const interval = setInterval(() => setTimer(formatClock(endDate, remaining)), clockFrequency.tick)
        return () => clearInterval(interval)
    }, [endDate, remaining])

    return timer
}

/**
 * Return a countdown timer string (If running, null if not)
 * @param {Date} endDate 
 * @param {Interval} remaining 
 * @returns {null | [string, string] | [string, string, string]} - Time array ([mm, ss] | [hh, mm, ss])
 */
export function formatClock(endDate, remaining) {
    const range = endDate ? getRange(endDate) : remaining
    return range ? formatInterval(range) : null
}

/**
 * Format an interval as a clock object (Array of zero-padded number strings)
 * @param {Interval} interval
 * @returns {[string, string] | [string, string, string]} - Time array ([mm, ss] | [hh, mm, ss])
 */
const formatInterval = ({ hours, minutes = 0, seconds = 0 } = {}) => hours ? [
    hours.toString(),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0'),
] : [
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0'),
]

/**
 * Determine if the timer has run out
 * @param {Date} endDate 
 * @param {Interval} remaining 
 * @returns {Boolean} - True if the round has ended
 */

/**
 * Test if an interval is zero.
 * @param {any} interval 
 * @returns {Boolean} - True if sum of interval = zero
 */
export const isZero = (interval) => !interval || !Object.values(interval).some(Boolean)

/// --- HELPERS --- ///

/**
 * Get State of event clock
 * @param {{ clockstart?: Date, clockmod?: Interval }} clockData 
 * @param {int} end 
 * @param {Interval} remaining 
 * @returns {int} - [0: stopped, 1: running, 2: paused, 3: ended]
 */
const getState = ({ clockstart, clockmod }, end = Number.POSITIVE_INFINITY, remaining = null) =>
    clockstart !== null ? (end < new Date() ? 3 : 1) :
    clockmod === null ? 0 : isZero(remaining) ? 3 : 2


/**
 * Get time remaining on paused event clock
 * WARNING!! Doesn't work on running clock
 * @param {{ clocklimit: Interval, clockmod?: Interval }} clockData
 * @returns {Interval | null} - Interval remaining on clock
 */
const getRemaining = ({ clockmod, clocklimit }) => !clockmod ? clocklimit :
    toInterval(Math.max(0, toMs(clocklimit) - toMs(clockmod)))


/**
 * Get time ending timestamp of event clock
 * WARNING!! Only works on a running gameclock
 * @param {{ clockstart?: Date, clocklimit?: Interval }} clockData 
 * @returns {Date | null} - Timestamp of when clock ends
 */
const getEnd = ({ clockstart, clocklimit }) =>  (console.log("CLOCKSTART",clockstart, typeof(clockstart)) || clockstart) &&
    new Date(clockstart.getTime() + toMs(clocklimit))

/**
 * Convert a date range into an interval
 * @param {Date} endDate - Date that timer ends
 * @returns {{hours?: int, minutes: int, seconds: int}} - Time until timer ends
 */
const getRange = (endDate, startDate = new Date()) => {
    const time = (endDate - startDate) / 1000
    if (time <= 0) return {}
    return {
        hours: Math.floor(time / 3600),
        minutes: Math.floor((time % 3600) / 60),
        seconds: Math.floor((time % 60)),
    }
}

/**
 * Convert an interval w/o months/years into milliseconds.
 * @param {Interval} interval 
 * @returns {Number} - interval as milliseconds
 */
const toMs = (interval) => !interval ? 0 :
    ((((((interval.days||0)) * 24 +
        (interval.hours||0)) * 60 +
            (interval.minutes||0)) * 60 +
                (interval.seconds||0)) * 1000 +
                    (interval.milliseconds||0));

/**
 * Convert a millisecond count into an Interval object.
 * @param {Number} ms - Number of milliseconds
 * @returns {any} - milliseconds split into an interval
 */
function toInterval(ms) {
    if (ms <= 0) return null
    const interval = {}
    interval.milliseconds = ms % 1000
    ms = Math.floor(ms / 1000)
    interval.seconds = ms % 60
    ms = Math.floor(ms / 60)
    interval.minutes = ms % 60
    ms = Math.floor(ms / 60)
    interval.hours = ms % 24
    ms = Math.floor(ms / 24)
    interval.days = ms
    if (ms > 31) throw Error(`Clock is set too high: ${JSON.stringify(interval)}`)
    return interval
}
