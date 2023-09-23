import React from "react"
import { useUpdateVoterMutation } from "../voter.fetch"
import { PlanRowStyle } from "../styles/PlanStyles"
import DateMultiSelect from "./DateMultiSelect"
import { GeneralSectionStyle } from "../styles/PlanTabVoteStyles"
import EventDragger from "./EventDragger"
import { useRankState } from "../services/planVote.services"
import { planEvents } from "../services/plan.utils"
import { useServerListValue } from "../../common/common.hooks"
import { plan as config } from "../../../assets/config"


function PlanTabVote({ voter, events, settings }) {
    
    const [ updateVoter ] = useUpdateVoterMutation()
    
    const eventList = planEvents(events)

    // Voter.Days
    const [ dates, setDates ] = useServerListValue(
        voter?.days,
        (days) => updateVoter({ id: voter?.id, days }),
        { throttleDelay: config.updateDelay },
    )

    // Voter.Events
    const [ ranked, setRanked ] = useRankState(voter, updateVoter)

    const unranked = eventList.filter((id) => !ranked.includes(id))
    

    return (<>
        <GeneralSectionStyle header="Pick Available Days">
            <DateMultiSelect range={settings?.plandates} value={dates} onChange={setDates} />
        </GeneralSectionStyle>

        <PlanRowStyle>
            <GeneralSectionStyle header="Ranked Events">
                <EventDragger
                    boxId="ranked"
                    eventIds={ranked}
                    events={events}
                    slots={eventList.length}
                    onDrop={setRanked}
                    numberSlots={true}
                />
            </GeneralSectionStyle>

            <GeneralSectionStyle header="Unranked Events">
                <EventDragger
                    boxId="unranked"
                    eventIds={unranked}
                    events={events}
                    slots={Math.max(unranked.length, 1)}
                    onDrop={setRanked}
                />
            </GeneralSectionStyle>
        </PlanRowStyle>
    </>)
}

export default PlanTabVote