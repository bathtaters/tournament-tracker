import { useCallback, useMemo } from "react"
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


// Get plan events from all events
export const planEvents = (events) => Object.keys(events).filter((id) => events[id].plan)


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

export function useDateRangeList([ dateStart, dateEnd ]) {
    return useMemo(() => {
        if (!dateStart || !dateEnd) return []

        let arr = []
        let date = new Date(dateStart)
        const end = new Date(dateEnd)
        
        while (date <= end) {
            arr.push(date.toISOString().slice(0,10))
            date.setDate(date.getDate() + 1)
        }
        return arr

    }, [dateStart, dateEnd])
}

export const formatDate = (date, incYear) => date &&
    new Date(date).toLocaleDateString(undefined, {
        timeZone: 'UTC',
        month: 'short',
        day: 'numeric',
        year: incYear ? 'numeric' : undefined
    })


// ARRAY UTILITIES \\

export const arrayPad = (array, padLength) => padLength < array.length ? array :
    [ ...array, ...Array(padLength).slice(array.length) ]

export const swap = (arr, idx) => {
    if (idx.length !== 2 || idx[0] === idx[1]) return arr

    idx.sort()
    return [
        ...arr.slice(0, idx[0]),
        arr[idx[1]],
        ...arr.slice(idx[0] + 1, idx[1]),
        arr[idx[0]],
        ...arr.slice(idx[1] + 1),
    ]
}

export const insert = (array, idx, value) => [
    ...array.slice(0, idx),
    value,
    ...array.slice(idx + 1),
]

export const addOrRemove = (values) => (array) => values.reduce(
    (result, value) => 
        result.includes(value) ? result.filter((v) => v !== value) : [ ...result, value ],
    array
)