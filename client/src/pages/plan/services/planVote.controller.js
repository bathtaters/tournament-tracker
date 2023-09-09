import { useEffect, useState } from "react"
import { useGenPlanMutation } from "../voter.fetch"
import { usePlanSettings } from "./plan.utils"
import { planTitle } from "../../../assets/constants"

export const planTabs = [ 'Vote', 'View' ]

export default function usePlanVoteController() {
    const { voter, voters, access, settings, events, setStatus, isLoading, error } = usePlanSettings()
    
    const [ generatePlan ] = useGenPlanMutation()

    const [ tab, selectTab ] = useState(access > 2 && !voter ? 1 : 0)
    useEffect(() => { if (access > 2 && !voter) selectTab(1) }, [access, voter])

    return {
        data: tab === 1 ? voters : voter,
        events, settings,
        
        isLoading, error,
        isVoter: access && (access > 1 || voter),
        
        title: planTitle[settings.planstatus],
        access: access,
        handleSetup: setStatus(1),
        handleGenerate: () => generatePlan(),

        showTabs: access > 2 && !!voter,
        tab, selectTab,
    }
}
