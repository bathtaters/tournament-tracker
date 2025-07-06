import { useMemo } from "react"
import {
    ViewWrapperStyle, GeneralSectionStyle, ViewCellStyle,
    ViewCellSectionStyle, ViewEventStyle, ViewDateStyle
} from "../styles/PlanTabViewStyles"
import { usePlayerQuery } from "../voter.fetch"
import { dateListToRange, formatDate, indexedKeys } from "../services/plan.utils"
import { PlanRowStyle } from "../styles/PlanStyles"


function PlanTabView({ voters = {}, events = {}, settings = {} }) {
    const { data: players = {} } = usePlayerQuery()
    const dateRange = settings.plandates || []

    const sortedVoters = useMemo(() => indexedKeys(voters), [voters])

    return (<>
        <PlanRowStyle>
            <GeneralSectionStyle header={"Schedule Range"}> 
                {formatDate(dateRange[0], true)} – {formatDate(dateRange[1], true)}
            </GeneralSectionStyle>
            
            <GeneralSectionStyle header={"Events Per Day"}> {settings.dayslots}</GeneralSectionStyle>
        </PlanRowStyle>

        <ViewWrapperStyle>
            {sortedVoters.map((id) => (
                <ViewCellStyle key={id} header={players[id]?.name}>
                    <ViewCellSectionStyle header="Unavailable" emptyHeader="Available all dates">
                        {dateListToRange(voters[id].days).map((range) =>
                            <ViewDateStyle key={range.join()} dateRange={range} />
                        )}
                    </ViewCellSectionStyle>
                    
                    <ViewCellSectionStyle ListTag="ol" header="Votes" emptyHeader="No Votes">
                        {voters[id].events?.map((id, idx) =>
                            <ViewEventStyle key={id || idx} title={events[id]?.title} />
                        )}
                    </ViewCellSectionStyle>
                </ViewCellStyle>
            ))}
        </ViewWrapperStyle>
    </>)
}

export default PlanTabView