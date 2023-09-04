import { useEffect, useState } from "react"
import { usePlanSettings } from "./plan.utils"
import { planTitle } from "../../../assets/constants"

export const planTabs = [ 'Vote', 'View' ]

export default function usePlanVoteController() {
    const { voter, voters, access, settings, setStatus, isLoading, error } = usePlanSettings()
    
    const [ tab, selectTab ] = useState(access > 2 && !voter ? 1 : 0)
    useEffect(() => { if (access > 2 && !voter) selectTab(1) }, [access, voter])

    return {
        data: tab === 1 ? voters : voter,
        
        isLoading, error,
        redirect: !access || (access < 2 && !voter),
        
        title: planTitle[settings.planstatus],
        access: access,
        setStatus,

        showTabs: access > 2 && !!voter,
        tab, selectTab,
    }
}
