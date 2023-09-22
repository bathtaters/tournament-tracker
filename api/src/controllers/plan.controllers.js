const plan = require('../db/models/plan')
const event = require('../db/models/event')
const voter = require('../db/models/voter')
const setting = require('../db/models/settings')
const generatePlan = require('../services/plan.services')
const { fromObjArray } = require('../services/settings.services')
const { planStatus, updateProg } = require('../utils/plan.utils')

// Get plan status (Used for polling)
const getStatus = async (_, res) => {
    const settings = await setting.get(['planstatus', 'planprogress'])
    return res.sendAndLog(fromObjArray(settings))
}

// Send plan data to plan generator, then update database to result & goto Plan Finish
async function genPlanAsync() {
    await setting.batchSet(planStatus(3, 0))

    try {
        const events   = await event.get(null, false, true)
        const voters   = await voter.get()
        const settings = await setting.getAll().then(fromObjArray)
        
        const planData = await generatePlan(events, voters, settings, updateProg(setting.batchSet))
        await plan.multiset(planData)
        await setting.batchSet(planStatus(4, 100))

    } catch (err) {
        await setting.batchSet(planStatus(2))
        throw err
    }
}
const genPlan = (_, res) => { genPlanAsync(); res.sendAndLog({ submitted: true })  }

// Move all planned events to schedule, move all other events to unscheduled, & goto Plan Start
const savePlan = async (_, res) => {
    await plan.update({ day: null }, false, 'plan')
    const ids = await plan.update({ plan: false })

    await setting.batchSet(planStatus(0))
    return res.sendAndLog(ids)
}

// Remove all voters/planned events and settings
const resetPlan = (_, res) => plan.reset().then(() => res.sendAndLog({ success: true }))

module.exports = {
    getStatus,
    genPlan,
    savePlan,
    resetPlan,
};