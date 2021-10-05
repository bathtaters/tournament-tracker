// CLOCK Conversions
const { clockStates } = require('../db/constants');

// function toCount(clock) {
//     if (!clock.clockstart) return clock.clockmod == 0 ? -1 : Math.floor(clock.clockmod);
//     const secs = Math.floor(clock.clockmod + (new Date() - clock.clockstart) / 1000);
//     return secs;
// }
// function toRemaining(clock) {
//     if (!clock.clockstart && clock.clockmod == 0) return -1;
//     const secs = clock.clocklimit - toCount(clock);
//     return secs < 0 ? 0 : secs;
// }
// function toEndTime(clock) {
//     if (!clock.clockstart) return;
//     return new Date(clock.clockstart.getTime() + (clock.clocklimit + clock.clockmod) * 1000);
// }
// function toState(clock) {
//     if (!clock.clockstart) return clockStates[clock.clockmod == 0 ? 2 : 3];
//     return clockStates[toRemaining(clock) ? 1 : 0];
// }

const checkInt = i => {
    if (i.year || i.months || i.days)
        throw Error("Clock is set too high: "+i);
}

const msCount = i => i && 
    checkInt(i) ||
    ((((i.hours||0) * 60 +
        (i.minutes||0)) * 60 +
            (i.seconds||0)) * 1000 +
                (i.milliseconds||0));

const toCount = ({ startmod, mod, lim }) => Math.min(
    msCount(lim) / 1000, // max value
    startmod ? (new Date() - startmod) / 1000 :
        (mod ? msCount(mod) / 1000 : -1));

const toRemaining = ({ endtime, mod, lim }) => Math.max(0,
    endtime ? (endtime - new Date()) / 1000 :
        (mod ? (msCount(lim) - msCount(mod)) / 1000 : null));

const toState = ({ state, endtime }) =>
    clockStates[ state > 1 ? state : +(toRemaining({endtime}) > 0) ];

// State from DB is: [1: on, 2: off, 3: paused]
// State from Constants is [ended, running, off, paused]
const calcAll = (clock) => ({
    lim: clock.lim,
    endTime: clock.endtime,
    state: toState(clock),
    count: toCount(clock),
    remaining: toRemaining(clock),
});


module.exports = {
    toCount, toRemaining, toState, calcAll,
}