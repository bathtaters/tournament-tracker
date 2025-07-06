const { parentPort } = require("worker_threads")
const { join } = require('path')
const logger = require("../utils/log.adapter")
const { dayCount } = require("../utils/shared.utils")
const { multiset } = require("../db/models/plan")
const { batchSet: setSetting, get: getSetting } = require('../db/models/settings')
const { asType, toObjArray } = require('./settings.services')
const { multithread, abort, isActive, isAborted } = require("../utils/multithread.utils")
const { filterUnvoted, getVoterSlots, planToEvent, resetEvent, daysOffByPlayer, progUpdatePercent, maxPlan, threadCount, planStatus } = require("../utils/plan.utils")
const { permutationCount, getPermutations } = require("../utils/combination.utils")
const { planId } = require("../config/meta")

const threadFile = join(__dirname, 'plan.thread.js')
const parentPlanId = `${planId}.parent`

/* Export for spawning this file as a Worker thread -- Args = [events, voters, settings], Req = simpleReq(req) */
if (parentPort) {
    require('../db/admin/connect').openConnection(); // Ensure that DB has been loaded

    parentPort.on('message', async ({ args, req }) => {
        try {
            // Run processor-intensive plan generator
            const planData = await generatePlan(...args)
                .then((data) => data?.filter(({ id }) => id))
    
            // Update DB with result
            if (planData != null) {
                await multiset(planData, req)
                await setSetting(planStatus(4, 100), req)
            }
        } catch (err) {
            await setSetting(planStatus(2), req)
            logger.error('Plan generator failed in genPlanAsync:', err)
            throw err
        }
        parentPort.close()
    })
    
    parentPort.on('close', () => {
        if (isActive(parentPlanId)) logger.error('Plan thread terminated early', parentPlanId)
        return cancelPlan()
    })
    parentPort.on('messageerror', (err) => {
        logger.error('Plan thread terminated due to error', parentPlanId, err)
        return cancelPlan()
    })
}


/** Main plan generator: may be triggered as a spawned thread
 * - Accepts planEvents, voters & settings, returns event array ({ id, day, slot, players }) */
async function generatePlan(events, voters, settings = {}, forceEmpties = false) {
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

    voters = getVoterSlots(voters, slots, dates[0])

    let remainingEvents = events.map(({ id }) => id)
    events = filterUnvoted(events, voters)
    if (!events.length) throw new Error("No events have been voted for")

    // Initialize progress bar
    const progTotal = permutationCount(events.length, slotCount, forceEmpties || events.length < slotCount)
    const progInt = progTotal * progUpdatePercent
    let prog = 0, nextProg = progInt
    await updateProg(0, progTotal)

    // Initialize thread data
    const schedules = getPermutations(events, slotCount, forceEmpties || events.length < slotCount)
    const extraData = {
        events, voters, slots, dates, slotCount,
        daysOff: daysOffByPlayer(dates, voters),
    }
    const updateBestPlan = async (nextPlan) => {
        // Write out progress bar updates
        if (prog++ >= nextProg) {
            await updateProg(prog, progTotal)
            nextProg += progInt
        }
    
        bestPlan = maxPlan(bestPlan, nextPlan)
    }

    try {
        // Determine every possible schedule given the events and slots
        await multithread(planId, threadFile, threadCount, schedules, updateBestPlan, extraData)
    } catch (err) {
        if (!isAborted(planId)) throw err // Actual error
        // Log 'abort' action
        logger.warn('Plan generation ended early.', String(err))
        return
    }

    // Finish 
    await updateProg(progTotal, progTotal)

    // Handle no matches found
    if (isNaN(bestPlan.score)) {
        if (forceEmpties || events.length < slotCount)
            throw new Error("No valid plans were found, check that there are enough players")

        logger.debug("No matches found, checking partial schedules")
        return generatePlan(events, voters, settings, true)
    }

    // Select plan & reset data for remaining events
    remainingEvents = remainingEvents.filter(
        (event) => !bestPlan.plan.some(({ id }) => event === id)
    )
    return bestPlan.plan.map(planToEvent).concat(remainingEvents.map(resetEvent))
}

// HELPERS \\

/** Cancel all threads */
const cancelPlan = async (threadsOnly = false) => {
    let cancelled = false
    if (isActive(planId)) await abort(planId).then(() => { cancelled = true }).catch(() => {})
    if (!threadsOnly && isActive(parentPlanId))
        await abort(parentPlanId).then(() => { cancelled = true }).catch(() => {})
    return cancelled
}

async function updateProg(prog, total) {
    await setSetting(toObjArray({ planprogress: 100 * prog / total }), null)
    const status = await getSetting('planstatus').then(asType)
    if (status !== 3) return cancelPlan().then(() => {
        if (prog < total) logger.log("Plan generation cancelled early.")
    })
}

module.exports = { generatePlan, cancelPlan, parentPlanId }