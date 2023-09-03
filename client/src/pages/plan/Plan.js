import React from "react";
import { Navigate } from "react-router-dom";

import PlanStart from "./PlanStart";
import PlanVote from "./PlanVote";
import PlanFinish from "./PlanFinish";
import Loading from "../common/Loading";

import { useSettingsQuery } from "./voter.fetch";
import { useAccessLevel } from "../common/common.fetch";

function Plan() {
    const { data: settings, isLoading, error } = useSettingsQuery();
    const { access, isLoading: accessLoading } = useAccessLevel()

    if (isLoading || accessLoading || error) return <Loading loading={isLoading} error={error} altMsg="Loading..." />
    
    if (settings.planstatus === 1 && access > 1) return <PlanStart  />
    if (settings.planstatus === 2 && access)     return <PlanVote   />
    if (settings.planstatus === 3)               return <PlanFinish />
    
    return <Navigate replace to="/home" />
}

export default Plan;