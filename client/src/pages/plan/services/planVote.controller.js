import { useEffect, useState } from "react"
import { useGenPlanMutation } from "../voter.fetch"
import { usePlanSettings } from "./plan.utils"
import { planTitle } from "../../../assets/constants"

export const planTabs = [ 'Vote', 'View' ]

export default function usePlanVoteController() {
    const { voter, voters, access, settings, events, setStatus, isLoading, error, flashError } = usePlanSettings()
    
    const [ generatePlan ] = useGenPlanMutation()

    const [ tab, selectTab ] = useState(!isLoading && access > 2 && !voter ? 1 : 0)
    useEffect(() => { if (!isLoading && access > 2 && !voter) selectTab(1) }, [isLoading, access, voter])

    return {
        data: tab === 1 ? voters : voter,
        events, settings,
        
        isLoading, error, flashError,
        isVoter: access && (access > 2 || voter),
        
        title: planTitle[settings.planstatus],
        access: access,
        handleSetup: setStatus(1),
        handleGenerate: () => generatePlan(),

        showTabs: Boolean(access && voter && access > 2),
        tab: access > 2 ? tab : 0,
        selectTab,
    }
}
