import React from "react";

function PlanFinish({ updatePlan }) {
    return <button className="link link-hover link-secondary" onClick={() => updatePlan({ status: 1 })}>Plan: Finish</button>
    // (Before Finished) PROGRESS BAR
    // VIEW PROPOSED SCHEDULE
    // (SuperUser) APPEND GAMES TO SCHEDULE BUTTON -- also auto-hides Plan section
    // (SuperUser) REPLACE SCHEDULE BUTTON -- also auto-hides Plan section
}

export default PlanFinish;