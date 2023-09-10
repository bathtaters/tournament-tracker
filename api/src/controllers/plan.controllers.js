const plan = require('../db/models/plan')
const event = require('../db/models/event')
const voter = require('../db/models/voter')
const setting = require('../db/models/settings')
const generatePlan = require('../services/plan.services')
const { fromObjArray, toObjArray } = require('../services/settings.services')

// Advance plan to final stage (View Proposed Schedule)
const planStart  = toObjArray({ planstatus: 0 })
const planFinish = toObjArray({ planstatus: 3 })

// Send plan data to plan generator, then update database to result & goto Plan Finish
const genPlan = async (_, res) => {
    const events   = await event.get(null, false, true)
    const voters   = await voter.get()
    const settings = await setting.getAll().then(fromObjArray)

    const planData = generatePlan(events, voters, settings)
    const ids = await plan.multiset(planData)

    await setting.batchSet(planFinish)
    return res.sendAndLog(ids)
}

// Move all planned events to schedule, move all other events to unscheduled, & goto Plan Start
const savePlan = async (_, res) => {
    await plan.update({ day: null }, false, 'plan')
    const ids = await plan.update({ plan: false })

    await setting.batchSet(planStart)
    return res.sendAndLog(ids)
}

// Remove all voters/planned events and settings
const resetPlan = (_, res) => plan.reset().then(() => res.sendAndLog({ success: true }))

module.exports = {
    genPlan,
    savePlan,
    resetPlan,
};