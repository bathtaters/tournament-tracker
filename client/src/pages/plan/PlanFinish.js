import React from "react"
import { PlanWrapperStyle, PlanTitleStyle, PlanFooterStyle, PlanButton } from "./styles/PlanStyles"
import { usePlanSettings } from "./services/plan.utils"
import { planTitle } from "../../assets/constants"

function PlanFinish() {
    const { access, settings, setStatus } = usePlanSettings()

    // if processing: Display bar

    return (
        <PlanWrapperStyle>
            <PlanTitleStyle
                title={planTitle[settings.planstatus]}
                left={access > 2 && <PlanButton className="btn-secondary" onClick={setStatus(2)}>← Re-Vote</PlanButton>}
            />
            
            
            <div className="flex justify-center items-center border min-h-[24rem] w-full m-4">
                <span>UNDER CONSTRUCTION</span>
            </div>

            {access > 2 && 
                <PlanFooterStyle>
                    <PlanButton onClick={setStatus(1)}>Add To Schedule</PlanButton>
                    <PlanButton className="btn-error" onClick={setStatus(1)}>Replace Schedule</PlanButton>
                </PlanFooterStyle>
            }
        </PlanWrapperStyle>
    )

}

export default PlanFinish