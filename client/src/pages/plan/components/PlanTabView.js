import React from "react"
import {
    ViewWrapperStyle, GeneralSectionStyle, ViewCellStyle,
    ViewCellSectionStyle, ViewEventStyle, ViewNoDateStyle, ViewDateStyle
} from "../styles/PlanTabViewStyles"
import { usePlayerQuery } from "../voter.fetch"
import { dateListToRange, formatDate } from "../services/plan.utils"
import { PlanRowStyle } from "../styles/PlanStyles"


function PlanTabView({ voters = {}, events = {}, settings = {} }) {
    const { data: players = {} } = usePlayerQuery()
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
                        { voter.days.length ?
                            dateListToRange(voter.days).map((range) =>
                                <ViewDateStyle key={range.join()} dateRange={range} />
                            )
                            :
                            <ViewNoDateStyle />
                        }
                    </ViewCellSectionStyle>

                    <ViewCellSectionStyle header="Vote" ListTag="ol">
                        {voter.events.map((id,idx) => <ViewEventStyle key={id || idx} title={events[id]?.title} />)}
                    </ViewCellSectionStyle>
                </ViewCellStyle>
            ))}
        </ViewWrapperStyle>
    </>)
}

export default PlanTabView