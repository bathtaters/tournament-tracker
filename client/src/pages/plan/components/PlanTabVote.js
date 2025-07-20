import { useMemo } from "react"
import { useUpdateVoterMutation } from "../voter.fetch"
import { PlanRowStyle } from "../styles/PlanStyles"
import DateMultiSelect from "./DateMultiSelect"
import { GeneralSectionStyle } from "../styles/PlanTabVoteStyles"
import EventDragger from "./EventDragger"
import { useRankState } from "../services/planVote.services"
import { getPlanned } from "../services/plan.utils"
import { useServerListValue } from "../../common/common.hooks"
import { plan as config } from "../../../assets/config"


function PlanTabVote({ voter, events, settings }) {
    
    const [ updateVoter ] = useUpdateVoterMutation()
    const sortedEvents = useMemo(() => getPlanned(events), [events])

    // Voter.Days
    const [ dates, setDates ] = useServerListValue(
        voter?.days,
        (days) => updateVoter({ id: voter?.id, days }),
        { throttleDelay: config.updateDelay },
    )

    // Voter.Events
    const { ranked, handleDrop, handleClick } = useRankState(voter, updateVoter)
    const unranked = sortedEvents.filter((id) => !ranked.includes(id))
    

    return (<>
        <GeneralSectionStyle header="Availability">
            <DateMultiSelect range={settings?.plandates} value={dates} onChange={setDates} />
        </GeneralSectionStyle>

        <PlanRowStyle>
            <GeneralSectionStyle header="Ranked">
                <EventDragger
                    boxId="ranked"
                    eventIds={ranked}
                    events={events}
                    slots={sortedEvents.length}
                    onDrop={handleDrop}
                    onClick={handleClick}
                    numberSlots={true}
                />
            </GeneralSectionStyle>

            <GeneralSectionStyle header="Unranked">
                <EventDragger
                    boxId="unranked"
                    eventIds={unranked}
                    events={events}
                    slots={Math.min(unranked.length + 1, sortedEvents.length)}
                    onDrop={handleDrop}
                    onClick={handleClick}
                />
            </GeneralSectionStyle>
        </PlanRowStyle>
    </>)
}

export default PlanTabVote