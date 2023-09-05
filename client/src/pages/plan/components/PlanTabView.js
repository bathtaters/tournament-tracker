import React from "react"
import { ViewWrapperStyle, GeneralSectionStyle, ViewCellStyle, ViewCellSectionStyle, ViewAllEventsStyle, ViewEventStyle } from "../styles/PlanTabViewStyles"
import { usePlayerQuery } from "../voter.fetch"
import { formatDate } from "../services/plan.utils"
import { PlanRowStyle } from "../styles/PlanStyles"


function PlanTabView({ voters = {}, events = {}, settings = {} }) {
    const { data: players } = usePlayerQuery()
    const dateRange = settings.plandates || []

    return (<>
        <PlanRowStyle>
            <GeneralSectionStyle header={"Schedule Range"}> 
                {formatDate(dateRange[0], true)} – {formatDate(dateRange[1], true)}
            </GeneralSectionStyle>
            
            <GeneralSectionStyle header={"Events Per Day"}> {settings.dayslots}</GeneralSectionStyle>
        </PlanRowStyle>

        <ViewWrapperStyle>
            {Object.values(voters).map((voter) => (

                <ViewCellStyle key={voter.id} header={players[voter.id]?.name}>
                    <ViewCellSectionStyle header="Unavailable">
                        {voter.days.map(formatDate).join(', ') || 'None'}
                    </ViewCellSectionStyle>

                    <ViewAllEventsStyle header="Vote">
                        {voter.events.map((id) => <ViewEventStyle key={id} title={events[id]?.title} />)}
                    </ViewAllEventsStyle>
                </ViewCellStyle>
            ))}
        </ViewWrapperStyle>
    </>)
}

export default PlanTabView