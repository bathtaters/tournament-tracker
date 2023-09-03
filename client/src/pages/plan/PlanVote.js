import React from "react"
import { PlanWrapperStyle, PlanTitleStyle, PlanButton, PlanRowStyle } from "./styles/PlanStyles"
import { usePlanSettings } from "./services/plan.hooks"
import { useAccessLevel } from "../common/common.fetch"
import { planTitle } from "../../assets/constants"

function PlanVote() {
    const { access } = useAccessLevel()
    const { settings, setStatus } = usePlanSettings()

    // if guest OR player not in event: Redirect to /home

    return (
        <PlanWrapperStyle>
            <PlanTitleStyle
                title={planTitle[settings.planstatus]}
                left={access > 2 && <PlanButton className="btn-secondary" onClick={setStatus(1)}>← Setup</PlanButton>}
                right={access > 2 && <PlanButton onClick={setStatus(3)}>Generate</PlanButton>}
            />
            
            <div className="w-full m-4 p-4 border text-center">AVAILABILITY DATE PICKER</div>
            <PlanRowStyle>
                <div className="w-full min-h-32 border flex justify-center items-center">RANKED CHOICES</div>
                <div className="w-full min-h-32 border flex justify-center items-center">AVAILABLE EVENTS</div>
            </PlanRowStyle>

        </PlanWrapperStyle>
    )

}

export default PlanVote