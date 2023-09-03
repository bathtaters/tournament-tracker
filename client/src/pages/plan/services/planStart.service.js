import { useEffect, useState } from "react"
import { usePlanSettings } from "../services/plan.hooks"
import { useThrottle } from "../../common/services/basic.services"
import { plan as config } from "../../../assets/config"
import { dateArrToRange, dateRangeToArr, pickerDates } from "./dates.services"


export default function usePlanStart() {
    const { settings, setStatus, updateSettings } = usePlanSettings()
    const throttle = useThrottle(config.updateDelay)

    const [dates, setDates] = useState(pickerDates(settings, dateArrToRange(settings?.plandates)))
    const handleDateChange = (dates) => {
        setDates(pickerDates(settings, dates))
        throttle(() => updateSettings({ plandates: dateRangeToArr(dates, settings) }))
    }

    const [slots, setSlots] = useState(settings?.planslots)
    const handleSlotChange = (ev) => {
        const planslots = +(ev.target.value)
        setSlots(planslots)
        throttle(() => updateSettings({ planslots }))
    }

    const [players, setPlayers] = useState([])
    const handlePlayerChange = (players) => setPlayers(players)

    // FIX THIS --
    // eslint-disable-next-line
    useEffect(() => { if (settings?.plandates?.length) setDates(dateArrToRange(settings?.plandates)) }, [settings?.plandates?.[0], settings?.plandates?.[settings?.plandates?.length - 1]])
    // eslint-disable-next-line
    useEffect(() => { if (settings?.planslots != null) setSlots(settings?.planslots) }, [settings?.planslots])

    return {
        settings, setStatus,
        dates, handleDateChange,
        slots, handleSlotChange,
        players, handlePlayerChange,
    }
}