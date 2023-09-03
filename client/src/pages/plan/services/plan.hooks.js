import { useCallback } from "react"
import { useSettingsQuery, useUpdateSettingsMutation } from "../voter.fetch"

// const adaptPlanSettings = ({ dayslots, planstatus, plandates }) => ({ dayslots, planstatus, plandates })


export function usePlanSettings() {
    const { data: settings } = useSettingsQuery()
    const [ updateSettings ] = useUpdateSettingsMutation()

    const setStatus = useCallback((status) => () => updateSettings({ planstatus: status }), [updateSettings])

    // const updateVoter = useCallback((newInfo) => setVoter(voterInfo = { ...voterInfo, ...newInfo }), [])

    // const addPlayer = useCallback((id) => setPlayers(playerList = playerList.concat(newPlayer(id))), [])
    // const rmvPlayer = useCallback((id) => setPlayers(playerList = playerList.filter((p) => p.id === id)), [])

    // const addEvent = useCallback((id) => setEvents(eventList = eventList.concat(id)), [])
    // const rmvEvent = useCallback((id) => setEvents(eventList = eventList.filter((eId) => eId === id)), [])

    return {
        settings, updateSettings,
        setStatus,
    }
}
