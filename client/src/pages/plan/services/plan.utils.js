import { useCallback } from "react"
import { useSettingsQuery, useUpdateSettingsMutation, useUpdateVoterMutation, useVoterQuery } from "../voter.fetch"
import { useEventQuery, useSessionState } from "../../common/common.fetch"

export function usePlanSettings() {
    const { data: session,  isLoading: sLoad, error: sErr } = useSessionState()
    const { data: voters,   isLoading: aLoad, error: aErr } = useVoterQuery(null, { skip: !session?.access || session.access < 2 })
    const { data: voter,    isLoading: vLoad, error: vErr } = useVoterQuery(session?.id, { skip: !session?.id })
    const { data: events,   isLoading: eLoad, error: eErr } = useEventQuery()
    const { data: settings, isLoading: tLoad, error: tErr } = useSettingsQuery() // PlanSettings: { dayslots, planstatus, plandates }

    const [ updateSettings ] = useUpdateSettingsMutation()
    const [ updateVoter    ] = useUpdateVoterMutation()

    const setStatus = useCallback((planstatus) => () => updateSettings({ planstatus }), [updateSettings])

    const setDays   = useCallback((days)   => updateVoter({ id: voter?.id, days   }), [voter?.id, updateVoter])
    const setEvents = useCallback((events) => updateVoter({ id: voter?.id, events }), [voter?.id, updateVoter])

    return {
        access: session?.access,
        settings, setStatus, updateSettings,

        voter, voters, updateVoter,
        setDays:   voter?.id && setDays,

        events,
        setEvents: voter?.id && setEvents,

        isLoading: sLoad || aLoad || vLoad || eLoad || tLoad,
        error:     sErr  || aErr  || vErr  || eErr  || tErr,
    }
}


// DATE UTILITIES \\

export const datePickerToArr = ({ datestart, dateend } = {}, { startDate, endDate } = {}) => [
    startDate || datestart,
    endDate   || dateend,
]

export const serverDatesToArr = ({ datestart, dateend } = {}, dateArr = []) => [
    dateArr[0] || datestart,
    dateArr[1] || dateend,
]

export const dateArrToPicker = (dates) => ({ startDate: dates[0], endDate: dates[1] })

export function dateArrToList(dateArr) {
    if (!dateArr || !dateArr[0] || !dateArr[1]) return []
    let date = new Date(dateArr[0])
    const end = new Date(dateArr[1])
    
    let arr = []
    while (date <= end) {
        arr.push(new Date(date))
        date.setDate(date.getDate() + 1)
    }
    return arr
}

export const formatDate = (date, incYear) => date &&
    new Date(date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: incYear ? 'numeric' : undefined
    })