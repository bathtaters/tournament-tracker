import React from "react";

function PlanVote({ plan, updatePlan }) {
    return <button className="link link-hover link-secondary" onClick={() => updatePlan({ status: plan.status + 1 })}>Plan: Vote</button>
    // TITLE
    // (SuperUser) EDIT PLAN BUTTON -- Goto PlanStart
    // If player in event:
        // AVAILABILITY DATE PICKER
        // LIST OF AVAILABLE GAMES
        // GAME RANKER
    // (SuperUser) GENERATE SCHEDULE BUTTON -- Goto PlanFinish 
}

export default PlanVote;