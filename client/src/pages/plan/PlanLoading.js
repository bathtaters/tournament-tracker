import React from "react"
import { LoadingWrapper } from "../common/styles/LoadingStyle"
import { PlanWrapperStyle, PlanTitleStyle, PlanButton } from "./styles/PlanStyles"
import { usePlanSettings } from "./services/plan.utils"
import { planTitle } from "../../assets/constants"

function PlanLoading() {
    const { access, settings, setStatus } = usePlanSettings(true)

    return (
        <PlanWrapperStyle>
            <PlanTitleStyle
                title={planTitle[settings.planstatus]}
                left={access > 2 && <PlanButton className="btn-error" onClick={setStatus(2)}>← Cancel</PlanButton>}
            />

            <LoadingWrapper>This make take a while. Or not, who knows.</LoadingWrapper>

        </PlanWrapperStyle>
    )

}

export default PlanLoading