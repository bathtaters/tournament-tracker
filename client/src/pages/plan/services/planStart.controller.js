import { useSetVotersMutation, useSetEventsMutation } from "../voter.fetch"
import { usePlanSettings, datePickerToArr, serverDatesToArr } from "./plan.utils"
import { useServerListValue, useServerValue } from "../../common/common.hooks"
import { plan as config } from "../../../assets/config"

export default function usePlanStartController() {

    // Date Controller
    const { voters, settings, events, setStatus, updateSettings } = usePlanSettings(true)
    const [dates, setDates] = useServerListValue(
        serverDatesToArr(settings, settings?.plandates),
        (plandates) => updateSettings({ plandates }),
        { throttleDelay: config.updateDelay }
    )
    const handleDateChange = (dates) => setDates(datePickerToArr(settings, dates))
    
    // Slot Controller
    const [slots, setSlots] = useServerValue(
        settings?.planslots,
        (planslots) => updateSettings({ planslots }),
        { throttleDelay: config.updateDelay }
    )
    const handleSlotChange = (ev) => setSlots(+(ev.target.value))

    // Voters Controller
    const [ setVoters ] = useSetVotersMutation()
    const [players, setPlayers] = useServerListValue(
        voters ? Object.keys(voters) : [],
        (ids) => setVoters(ids),
        { throttleDelay: config.updateDelay }
    )
    const handlePlayerChange = (players) => setPlayers(players)
    
    // Events Controller
    const [ setEventPlan ] = useSetEventsMutation()
    const [planEvents, setEvents] = useServerListValue(
        events ? Object.keys(events).filter((id) => events[id].plan) : [],
        (ids) => setEventPlan(ids),
        { throttleDelay: config.updateDelay }
    )
    const handleEventChange = (events) => setEvents(events)

    return {
        settings, setStatus,
        dates, handleDateChange,
        slots, handleSlotChange,
        players, handlePlayerChange,
        events: planEvents, handleEventChange,
    }
}