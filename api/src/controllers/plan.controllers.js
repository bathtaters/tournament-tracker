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
async function genPlanAsync(userid) {
    await setting.batchSet(planStatus(3, 0))

    try {
        const events   = await event.get(null, false, true)
        const voters   = await voter.get()
        const settings = await setting.getAll().then(fromObjArray)
        
        const planData = await generatePlan(events, voters, settings, updateProg(setting.batchSet))
        await plan.multiset(planData, userid)
        await setting.batchSet(planStatus(4, 100), userid)

    } catch (err) {
        await setting.batchSet(planStatus(2), userid)
        throw err
    }
}
const genPlan = (req, res) => { genPlanAsync(req.session.user); res.sendAndLog({ submitted: true })  }

// Move all planned events to schedule, move all other events to unscheduled, & goto Plan Start
const savePlan = async (req, res) => {
    await plan.update({ day: null }, false, 'plan', req.session.user)
    const ids = await plan.update({ plan: false }, null, null, req.session.user)

    await setting.batchSet(planStatus(0), req.session.user)
    return res.sendAndLog(ids)
}

// Remove all voters/planned events and settings
const resetPlan = (req, res) => plan.reset(req.session.user).then(() => res.sendAndLog({ success: true }))

module.exports = {
    getStatus,
    genPlan,
    savePlan,
    resetPlan,
};