import React from "react"
import { Navigate } from "react-router-dom"
import Tabs from "../common/Tabs"
import Loading from "../common/Loading"
import PlanTabVote from "./components/PlanTabVote"
import PlanTabView from "./components/PlanTabView"
import { PlanWrapperStyle, PlanTitleStyle, PlanButton } from "./styles/PlanStyles"
import usePlanVoteController, { planTabs } from "./services/planVote.controller"

function PlanVote() {    
    const {
        data, events, settings,
        isLoading, error, redirect,
        title, access, setStatus,
        tab, selectTab, showTabs,
    } = usePlanVoteController()
    
    if (isLoading || error) return <Loading loading={isLoading} error={error} altMsg="Loading..." />

    if (redirect) return <Navigate replace to="/home" />

    return (
        <PlanWrapperStyle>
            <PlanTitleStyle
                title={title}
                left={access > 2 && <PlanButton className="btn-secondary" onClick={setStatus(1)}>← Setup</PlanButton>}
                right={access > 2 && <PlanButton onClick={setStatus(3)}>Generate</PlanButton>}
            />

            { showTabs && <Tabs labels={planTabs} value={tab} onChange={selectTab} /> }
            
            { tab === 0 && <PlanTabVote voter={data} events={events} settings={settings} /> }

            { tab === 1 && <PlanTabView voters={data} events={events} settings={settings} /> }

        </PlanWrapperStyle>
    )

}

export default PlanVote