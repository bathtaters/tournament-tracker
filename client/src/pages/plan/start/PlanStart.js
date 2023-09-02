import React from "react";

function PlanStart({ plan, updatePlan }) {
    return <button className="link link-hover link-secondary" onClick={() => updatePlan({ status: plan.status + 1 })}>Plan: Start</button>
    // TITLE
    // DATE SELECTOR
    // DAILY SLOTS SELECTOR
    // PLAYER SELECTOR
    // GAME CREATOR
    // (SuperUser) GO TO VOTE BUTTON
}

export default PlanStart;