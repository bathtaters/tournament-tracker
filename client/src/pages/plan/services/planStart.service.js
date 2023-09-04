import { useVoterQuery, useEventQuery, useSetVotersMutation, useSetEventsMutation } from "../voter.fetch"
import { datePickerToArr, serverDatesToArr } from "./dates.services"
import { usePlanSettings } from "../services/plan.hooks"
import { useServerListValue, useServerValue } from "../../common/common.hooks"
import { plan as config } from "../../../assets/config"

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


    const { data: voters } = useVoterQuery()
    const [ setVoters ] = useSetVotersMutation()
    const [players, setPlayers] = useServerListValue(
        voters ? Object.keys(voters) : [],
        (ids) => setVoters(ids),
        { throttleDelay: config.updateDelay }
    )
    const handlePlayerChange = (players) => setPlayers(players)
    

    const { data: eventData } = useEventQuery()
    const [ setEventPlan ] = useSetEventsMutation()
    const [events, setEvents] = useServerListValue(
        eventData ? Object.keys(eventData).filter((id) => eventData[id].plan) : [],
        (ids) => setEventPlan(ids),
        { throttleDelay: config.updateDelay }
    )
    const handleEventChange = (events) => setEvents(events)

    return {
        settings, setStatus,
        dates, handleDateChange,
        slots, handleSlotChange,
        players, handlePlayerChange,
        events, handleEventChange,
    }
}