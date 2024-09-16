const {  } = require('postgres-interval')

// Interval time periods
const epocs = ["years", "months", "days", "hours", "minutes", "seconds", "milliseconds"]

/**
 * Check if the provided Interval contains any year/month values.
 * @param {Interval} interval 
 */
const checkInterval = (interval) => {
    if (interval.years || interval.months)
        throw Error(`Clock is set too high: ${JSON.stringify(interval)}`)
}

/**
 * Convert an interval w/o months/years into milliseconds.
 * @param {SimpleInterval} interval 
 * @returns {Number} - interval as milliseconds
 */
const toMs = (interval) => !interval ? 0 :
    checkInterval(interval) ||
    ((((((interval.days||0)) * 24 +
        (interval.hours||0)) * 60 +
            (interval.minutes||0)) * 60 +
                (interval.seconds||0)) * 1000 +
                    (interval.milliseconds||0));

/**
 * Convert a millisecond count into an Interval object.
 * @param {Number} ms - Number of milliseconds
 * @returns {SimpleInterval} - milliseconds split into an interval
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


/**
 * Compare 2 Intervals for equality
 * @param {Interval} intA 
 * @param {Interval} intB
 * @returns {1 | 0 | -1} - 1 if A > B, 0 if A == B, -1 if A < B
 */
function intervalCompare(intA, intB) {
    if (!intA) return +!!intB
    if (!intB) return -1
    for (const epoc of epocs) {
        if ((intA[epoc] || 0) < (intB[epoc] || 0)) return -1
        if ((intA[epoc] || 0) > (intB[epoc] || 0)) return 1
    }
    return 0
}

module.exports = { checkInterval, toMs, toInterval, intervalCompare }


// --- TYPES --- //

/**
 * @typedef {Object} Interval
 * @property {number} [years]
 * @property {number} [months]
 * @property {number} [days]
 * @property {number} [hours]
 * @property {number} [minutes]
 * @property {number} [seconds]
 * @property {number} [milliseconds]
 */

/**
 * @typedef {Object} SimpleInterval
 * @property {number} [days]
 * @property {number} [hours]
 * @property {number} [minutes]
 * @property {number} [seconds]
 * @property {number} [milliseconds]
 */
