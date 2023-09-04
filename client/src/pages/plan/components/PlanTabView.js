import React from "react"
import { useEventQuery, usePlayerQuery } from "../../common/common.fetch"

function PlanTabView({ data = {} }) {
    const { data: players = {} } = usePlayerQuery()
    const { data: events = {} } = useEventQuery()
    return (
        <div className="flex flex-row flex-wrap justify-center items-start gap-4 m-4">
            {Object.values(data).map((voter) => 
                <div className="min-w-48 min-h-32 border flex flex-col justify-start items-center p-4 rounded-md" key={voter.id}>
                    <h4>{players[voter.id]?.name || '...'}</h4>
                    <h5>Available:</h5>
                    <div>{voter.days.join(', ')}</div>
                    <h5>Rank:</h5>
                    <ol>
                        {voter.events.map((id) => <li key={id}>{events[id]?.title || '...'}</li>)}
                    </ol>
                </div>
            )}
        </div>
    )
}

export default PlanTabView