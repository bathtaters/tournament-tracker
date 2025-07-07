import { useState } from "react"
import DaysContainer from "../schedule/components/DaysContainer"
import { PlanWrapperStyle, PlanTitleStyle, PlanFooterStyle, PlanButton } from "./styles/PlanStyles"
import { useSavePlanMutation } from "./voter.fetch"
import { usePlanSettings } from "./services/plan.utils"
import { useOpenAlert } from "../common/common.hooks"
import { savePlanAlert } from "../../assets/alerts"
import { planTitle } from "../../assets/constants"

function PlanFinish() {
    const [ isExpanded, setExpanded ] = useState(false)

    const { access, settings, setStatus } = usePlanSettings()
    const [ savePlan ] = useSavePlanMutation()
    const openAlert = useOpenAlert()

    const handleClick = async () => {
        const answer = await openAlert(savePlanAlert, 0)
        if (answer) savePlan()
    }

    return (
        <PlanWrapperStyle>
            <PlanTitleStyle
                title={planTitle[settings.planstatus]}
                left={access > 2 && <PlanButton className="btn-secondary" onClick={setStatus(2)}>← Re-Vote</PlanButton>}
                right={
                    <PlanButton className={isExpanded ? "btn-neutral" : "btn-primary"} onClick={() => setExpanded((x) => !x)}>{
                        isExpanded ? "Collapse" : "Expand"
                    }</PlanButton>
                }
            />
            
            <DaysContainer isPlan={true} expandAll={isExpanded} />

            {access > 2 && 
                <PlanFooterStyle>
                    <PlanButton className="btn-error" onClick={handleClick}>Save Schedule</PlanButton>
                </PlanFooterStyle>
            }
        </PlanWrapperStyle>
    )

}

export default PlanFinish