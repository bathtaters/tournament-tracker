import React from "react";
import { Navigate } from "react-router-dom";
import PlanStart from "./start/PlanStart";
import PlanVote from "./vote/PlanVote";
import PlanFinish from "./finish/PlanFinish";
import { usePlan } from "./plan.fetch";
import { useAccessLevel } from "../common/common.fetch";

function Plan() {
    const props = usePlan()
    const access = useAccessLevel()
    
    if (props.plan.status === 1 && access > 1) return <PlanStart  {...props} />
    if (props.plan.status === 2 && access)     return <PlanVote   {...props} />
    if (props.plan.status === 3 && access > 1) return <PlanFinish {...props} />
    
    return <Navigate replace to="/home" />
}

export default Plan;