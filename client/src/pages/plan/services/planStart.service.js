import { useState } from "react"
import { usePlanSettings } from "../services/plan.hooks"
import { plan as config } from "../../../assets/config"
import { datePickerToArr, serverDatesToArr } from "./dates.services"
import { useServerListValue, useServerValue } from "../../common/common.hooks"

export default function usePlanStart() {
    const { settings, setStatus, updateSettings } = usePlanSettings()

    const [dates, setDates] = useServerListValue(
        serverDatesToArr(settings, settings?.plandates),
        (plandates) => updateSettings({ plandates }),
        { throttleDelay: config.updateDelay }
    )
    const handleDateChange = (dates) => setDates(datePickerToArr(settings, dates))

    const [slots, setSlots] = useServerValue(
        settings?.planslots,
        (planslots) => updateSettings({ planslots }),
        { throttleDelay: config.updateDelay }
    )
    const handleSlotChange = (ev) => setSlots(+(ev.target.value))

    const [players, setPlayers] = useState([])
    const handlePlayerChange = (players) => setPlayers(players)
    
    const [events, setEvents] = useState([])
    const handleEventChange = (events) => setEvents(events)

    return {
        settings, setStatus,
        dates, handleDateChange,
        slots, handleSlotChange,
        players, handlePlayerChange,
        events, handleEventChange,
    }
}