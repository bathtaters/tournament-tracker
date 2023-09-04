import React from "react"
import { PlanRowStyle } from "../styles/PlanStyles"
import { useEventQuery } from "../../common/common.fetch"

function PlanTabVote({ data }) {
    const { data: events = {} } = useEventQuery()
    const eventList = Object.values(events).filter(({ plan }) => plan).map(({ title }) => title)

    return (
        <div>
            <div className="w-full my-4 p-4 border">DATE PICKER: {data?.days && data.days.join(', ')}</div>
            <PlanRowStyle>
                <div className="w-full min-h-32 border flex flex-col justify-start items-center p-2">
                    <h5>RANKED CHOICES</h5>
                    {data?.events && data.events.join(', ')}
                </div>
                <div className="w-full min-h-32 border flex flex-col justify-start items-center p-2">
                    <h5>AVAILABLE EVENTS</h5>
                    {eventList.join(', ')}
                </div>
            </PlanRowStyle>
        </div>
    )
}

export default PlanTabVote