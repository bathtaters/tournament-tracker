const plan = require('../db/models/plan')
const event = require('../db/models/event')
const voter = require('../db/models/voter')
const setting = require('../db/models/settings')
const generatePlan = require('../services/plan.services')
const { fromObjArray, toObjArray } = require('../services/settings.services')

// Convert status number into Settings object array
const planStatus = (planstatus) => toObjArray({ planstatus })

// Get plan status (Used for polling)
const getStatus = (_, res) => setting.get('planstatus').then((r) => res.sendAndLog({ planstatus: r?.value ? +r.value : 0 }))

// Send plan data to plan generator, then update database to result & goto Plan Finish
const genPlan = async (_, res) => {
    await setting.batchSet(planStatus(3))

    try {
        const events   = await event.get(null, false, true)
        const voters   = await voter.get()
        const settings = await setting.getAll().then(fromObjArray)
    
        const planData = await generatePlan(events, voters, settings)
        const ids = await plan.multiset(planData)
        await setting.batchSet(planStatus(4))
        return res.sendAndLog(ids)

    } catch (err) {
        await setting.batchSet(planStatus(2))
        throw err
    }

}

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