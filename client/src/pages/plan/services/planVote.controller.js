import { useState } from "react"
import { useVoterQuery } from "../voter.fetch"
import { usePlanSettings } from "./plan.hooks"
import { useSessionState } from "../../common/common.fetch"
import { planTitle } from "../../../assets/constants"

export const planTabs = [ 'Vote', 'View' ]


export default function usePlanVoteController() {
    const { settings, setStatus } = usePlanSettings()
    const { data: voters, isLoading, error } = useVoterQuery()
    const { data: session, isLoading: sessLoading, error: sessErr } = useSessionState()

    const [ tab, selectTab ] = useState(session.access > 2 && !(session.id in voters) ? 1 : 0)

    return {
        title: planTitle[settings.planstatus],
        access: session.access,
        setStatus,

        data: tab === 1 ? voters : voters[session.id],

        redirect: !session?.id || (session.access < 2 && !(session.id in voters)),
        isLoading: isLoading || sessLoading,
        error: error || sessErr,

        showTabs: session.access > 2 && session.id in voters,
        tab, selectTab,
    }
}
