import React from "react"
import Tabs from "../common/Tabs"
import Loading from "../common/Loading"
import PlanTabVote from "./components/PlanTabVote"
import PlanTabView from "./components/PlanTabView"
import { PlanWrapperStyle, PlanTitleStyle, PlanButton, PlanMessageStyle, PlanErrorStyle } from "./styles/PlanStyles"
import usePlanViewController, { planTabs } from "./services/planVote.controller"
import { planMessage } from "../../assets/constants"

function PlanVote() {    
    const {
        data, events, settings,
        isLoading, error, flashError,
        title, access, isVoter,
        setStatus, handleGenerate,
        tab, selectTab, showTabs,
    } = usePlanViewController()
    
    if (isLoading || error) return (
        <Loading loading={isLoading} error={error} altMsg="Loading..." />
    )
    
    if (!isVoter) return (
        <PlanMessageStyle>
            {access == null ? planMessage.notSignedIn : planMessage.notVoter}
        </PlanMessageStyle>
    )

    return (
        <PlanWrapperStyle>
            <PlanTitleStyle
                title={title}
                left={access > 2 && <PlanButton className="btn-secondary" onClick={setStatus(1)}>← Setup</PlanButton>}
                right={access > 2 && <PlanButton onClick={handleGenerate}>Generate</PlanButton>}
            />

            { flashError && <PlanErrorStyle>Planning error: {flashError}</PlanErrorStyle> }

            { showTabs && <Tabs labels={planTabs} value={tab} onChange={selectTab} /> }
            
            { tab === 0 && <PlanTabVote voter={data} events={events} settings={settings} /> }

            { tab === 1 && <PlanTabView voters={data} events={events} settings={settings} /> }

        </PlanWrapperStyle>
    )

}

export default PlanVote