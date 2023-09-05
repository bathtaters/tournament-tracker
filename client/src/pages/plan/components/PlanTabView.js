import React from "react"
import { ViewWrapperStyle, ViewSettingsStyle, ViewCellStyle, ViewCellSectionStyle, ViewAllEventsStyle, ViewEventStyle } from "../styles/PlanTabViewStyles"
import { usePlayerQuery } from "../voter.fetch"
import { formatDate } from "../services/plan.utils"


function PlanTabView({ voters = {}, events = {}, settings = {} }) {
    const { data: players } = usePlayerQuery()
    const dateRange = settings.plandates || []

    return (
        <div>
            <ViewSettingsStyle header={"Schedule Range"}> 
                {formatDate(dateRange[0], true)} – {formatDate(dateRange[1], true)}
            </ViewSettingsStyle>
            
            <ViewSettingsStyle header={"Events Per Day"}> {settings.dayslots}</ViewSettingsStyle>

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
        </div>
    )
}

export default PlanTabView