import { useCallback, useState } from "react";

export const planStatus = [ 'Hidden', 'Start', 'Vote', 'Finish' ];

let planInfo = {
    status: 1,
    slots: 2,
    dates: [ '2023-10-20', '2023-10-21', '2023-10-22', '2023-10-24', '2023-10-27' ],
}

let playerList = [], eventList = []

const newPlayer = (id) => ({
    id,
    dates: [],
    games: [],
})

export function usePlan() {
    const [ plan, setPlan ] = useState(planInfo)
    const [ players, setPlayers ] = useState(playerList)
    const [ events, setEvents ] = useState(eventList)

    const updatePlan = useCallback((newInfo) => setPlan(planInfo = { ...planInfo, ...newInfo }), [])

    const addPlayer = useCallback((id) => setPlayers(playerList = playerList.concat(newPlayer(id))), [])
    const rmvPlayer = useCallback((id) => setPlayers(playerList = playerList.filter((p) => p.id === id)), [])

    const addEvent = useCallback((id) => setEvents(eventList = eventList.concat(id)), [])
    const rmvEvent = useCallback((id) => setEvents(eventList = eventList.filter((eId) => eId === id)), [])

    return {
        plan, players, events,
        updatePlan,
        addPlayer, rmvPlayer,
        addEvent, rmvEvent,
    }
}