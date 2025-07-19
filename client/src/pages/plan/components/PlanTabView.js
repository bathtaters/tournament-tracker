import { useMemo } from "react"
import {
    ViewWrapperStyle, GeneralSectionStyle, ViewCellStyle,
    ViewCellSectionStyle, ViewEventStyle, ViewDateStyle,
    ViewScoreStyle,
    ViewErrors
} from "../styles/PlanTabViewStyles"
import RawData from "../../common/RawData"
import { PlanRowStyle } from "../styles/PlanStyles"
import { usePlayerQuery } from "../voter.fetch"
import { useVoterScores } from "../services/planVote.services"
import { dateListToRange, formatDate, indexedKeys } from "../services/plan.utils"


function PlanTabView({ voters = {}, events = {}, settings = {}, showScores = false }) {
    const { data: players = {} } = usePlayerQuery()
    const dateRange = settings.plandates || []

    const sortedVoters = useMemo(() => indexedKeys(voters), [voters])
    const { scores, totals, errors } = useVoterScores(voters, events, players, settings, !showScores)

    return (<>
        <ViewErrors errors={errors} />

        <PlanRowStyle>
            <GeneralSectionStyle header={"Schedule Range"}> 
                {formatDate(dateRange[0], true)} – {formatDate(dateRange[1], true)}
            </GeneralSectionStyle>
            
            <GeneralSectionStyle header={"Events Per Day"}> {settings.dayslots}</GeneralSectionStyle>
        </PlanRowStyle>

        <ViewWrapperStyle>
            <RawData data={totals} />
            {sortedVoters.map((id) => (
                <ViewCellStyle key={id} header={players[id]?.name}>
                    { scores && (
                        <ViewScoreStyle title="Accuracy" score={scores[id].weighted}>
                            <RawData data={scores[id]} className="text-xs" />
                        </ViewScoreStyle>
                    )}

                    <ViewCellSectionStyle header="Unavailable" emptyHeader="Available all dates">
                        {dateListToRange(voters[id].days).map((range) =>
                            <ViewDateStyle key={range.join()} dateRange={range} />
                        )}
                    </ViewCellSectionStyle>
                    
                    <ViewCellSectionStyle ListTag="ol" header="Votes" emptyHeader="No Votes">
                        {voters[id].events?.map((evId, idx) =>
                            <ViewEventStyle
                                key={evId || idx} title={events[evId]?.title}
                                isRegistered={scores?.[id]?.events?.includes(evId)}
                            />
                        )}
                        { scores?.[id]?.events && scores[id].events.map((evId, idx) =>
                            !voters[id].events.includes(evId) && (
                                <ViewEventStyle key={evId || idx} title={events[evId]?.title} isUnvoted={true} />
                            )
                        )}
                    </ViewCellSectionStyle>

                    <RawData data={voters[id]} className="text-xs" />
                </ViewCellStyle>
            ))}
        </ViewWrapperStyle>
    </>)
}

export default PlanTabView