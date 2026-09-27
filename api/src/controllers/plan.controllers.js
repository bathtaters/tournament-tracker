const { join } = require("path");
const logger = require("../utils/log.adapter");
const plan = require("../db/models/plan");
const event = require("../db/models/event");
const voter = require("../db/models/voter");
const setting = require("../db/models/settings");
const { generatePlan } = require("../services/plan.services");
const { spawnAsync } = require("../utils/multithread.utils");
const { fromObjArray } = require("../services/settings.services");
const { planSettings, clearPlanSettings } = require("../utils/plan.utils");
const { simpleReq } = require("../db/models/log");
const { threadSanitize } = require("../utils/shared.utils");
const { planId } = require("../config/meta");

const parentPlanFile = join(__dirname, "../services/plan.services"),
  runInThread = true; // Run plan generator in a non-blocking thread

// Get plan status (Used for polling)
const getStatus = async (req, res) => {
  const settings = await setting
    .get(["planstatus", "planprogress", "planerror"])
    .then(fromObjArray);

  return res.sendAndLog(settings);
};

// Send plan data to plan generator, then update database to result & goto Plan Finish
const genPlan = async (req, res) => {
  await setting.batchSet(clearPlanSettings(3), req);

  try {
    const events = await event.get(null, false, true).then(threadSanitize);
    const voters = await voter.get();
    const settings = await setting.getAll().then(fromObjArray);

    if (runInThread) {
      spawnAsync(
        planId,
        parentPlanFile,
        {
          args: [events, voters, settings],
          req: simpleReq(req),
        },
        (err) =>
          setting.batchSet(
            planSettings({
              planerror: err.message || "Plan generator failed to start.",
            }),
            req,
          ),
      );
    } else {
      const planData = await generatePlan(events, voters, settings).then(
        (data) => data.filter(({ id }) => id),
      );

      // Update DB with result
      await plan.multiset(planData, req);
      await setting.batchSet(
        planSettings({ planstatus: 4, planprogress: 100 }),
        req,
      );
    }

    return res.sendAndLog({ submitted: true });
  } catch (err) {
    await setting.batchSet(
      planSettings({
        planerror:
          "Plan generator failed. Report to the site admin if you can.",
      }),
      req,
    );
    logger.error("Plan generator failed:", err);
    res.sendAndLog({ submitted: false });
  }
};

// Move all planned events to schedule, move all other events to unscheduled, & goto Plan Start
const savePlan = async (req, res) => {
  await plan.update({ day: null }, 0, "plan", req);
  const ids = await plan.update({ plan: 0 }, null, null, req);

  await setting.batchSet(clearPlanSettings(0), req);
  return res.sendAndLog(ids);
};

// Remove all voters/planned events and settings
const resetPlan = (req, res) =>
  plan.reset(req).then(() => res.sendAndLog({ success: true }));

module.exports = {
  getStatus,
  genPlan,
  savePlan,
  resetPlan,
};
