import React, { useState } from "react"
import { PlanRowStyle } from "../styles/PlanStyles"
import DateMultiSelect from "./DateMultiSelect"
import { GeneralSectionStyle } from "../styles/PlanTabVoteStyles"
import EventDragger from "./EventDragger"
import { useRankState } from "../services/planVote.services"
import { planEvents } from "../services/plan.utils"


function PlanTabVote({ voter, events, settings }) {
    
    const eventList = planEvents(events)
    
    const [ dates, setDates ] = useState([])
    const [ ranked, setRanked ] = useRankState(eventList, voter)
    
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
                    slots={Math.min(unranked.length + 1, eventList.length)}
                    onDrop={setRanked}
                />
            </GeneralSectionStyle>
        </PlanRowStyle>
    </>)
}

export default PlanTabVote