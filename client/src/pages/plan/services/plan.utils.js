import { useCallback, useEffect, useMemo } from "react"
import { useDispatch } from "react-redux"
import { fetchApi } from "../../common/common.fetch"
import { useSettingsQuery, usePlanStatusQuery, useUpdateSettingsMutation, useUpdateVoterMutation, useVoterQuery } from "../voter.fetch"
import { useEventQuery, useSessionState } from "../../common/common.fetch"
import { plan as config } from "../../../assets/config"

export function usePollStatus(currentStatus, pollStatus) {
    const dispatch = useDispatch()
    const { data = {} } = usePlanStatusQuery(undefined, {
        skip: typeof currentStatus !== 'number',
        pollingInterval: pollStatus ? config.statusPoll : undefined,
        refetchOnFocus: true,
        refetchOnReconnect: true,
    })

    useEffect(() => {
        if (typeof currentStatus === 'number' && typeof data.planstatus === 'number' && data.planstatus !== currentStatus) dispatch(
            fetchApi.util.invalidateTags([ 'Settings', 'Schedule', 'Voter', 'Event' ])
        )
    }, [currentStatus, data.planstatus, dispatch])
    
    return data
}

export function usePlanSettings(pollStatus = false) {
    const { data: session,  isLoading: sLoad, error: sErr } = useSessionState()
    const { data: voters,   isLoading: aLoad, error: aErr } = useVoterQuery(undefined, { skip: !session?.access || session.access < 2 })
    const { data: voter,    isLoading: vLoad, error: vErr } = useVoterQuery(session?.id, { skip: !session?.id })
    const { data: events,   isLoading: eLoad, error: eErr } = useEventQuery()
    const { data: settings, isLoading: tLoad, error: tErr } = useSettingsQuery()

    const [ updateSettings ] = useUpdateSettingsMutation()
    const [ updateVoter    ] = useUpdateVoterMutation()

    const setStatus = useCallback((planstatus) => () => updateSettings({ planstatus }), [updateSettings])

    const setDays   = useCallback((days)   => updateVoter({ id: voter?.id, days   }), [voter?.id, updateVoter])
    const setEvents = useCallback((events) => updateVoter({ id: voter?.id, events }), [voter?.id, updateVoter])

    const { planprogress } = usePollStatus(settings?.planstatus, pollStatus)

    return {
        access: session?.access,
        settings, setStatus, updateSettings,

        voter, voters, updateVoter,
        setDays:   voter?.id && setDays,

        events,
        setEvents: voter?.id && setEvents,

        progress:  planprogress,
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

function isNextDay(dateA, dateB) {
    if (!dateA) return true

    let aDate = new Date(dateA)
    let bDate = new Date(dateB).getDate()

    aDate.setDate(aDate.getDate() + 1)
    return aDate.getDate() === bDate
}

export function dateListToRange(dates) {
    let ranges = [], currRange = []
    
    dates.forEach((date) => {
        if (isNextDay(currRange[currRange.length - 1], date))
            return currRange[currRange.length ? 1 : 0] = date

        ranges.push(currRange.map((d) => formatDate(d)))
        currRange = [date]
    })

    if (currRange.length) ranges.push(currRange.map((d) => formatDate(d)))
    return ranges
}


// ARRAY UTILITIES \\

/** Add value to array if it's not there, or remove it if it is */
export const addOrRemove = (value, array) => 
    array.includes(value) ? array.filter((v) => v !== value) : [ ...array, value ]

/** Pad out array to padLength using padVal */
export const arrayPad = (array, padLength, padVal) => padLength < array.length ? array :
    [ ...array, ...Array(padLength).fill(padVal).slice(array.length) ]


export const trimFalsy = (array, start = 0) => {
    
    let i = array.length
    while (!array[--i]) {
        if (i <= start) return []
    }
    return array.slice(start, i + 1)
}

export const arrRemove = (array, idx) => trimFalsy(arrInsert(array, idx))


export const arrInsert = (array, idx, value) => idx <= array.length ? [
    ...array.slice(0, idx),
    value,
    ...trimFalsy(array, idx + 1),
] : [
    ...arrayPad(array, idx),
    value,
]

export const arrShift = (array, idx, backward = false) => backward ? trimFalsy([
    ...array.slice(0, idx - 1),
    array[idx],
    array[idx - 1],
    ...array.slice(idx + 1),
]) : [
    ...array.slice(0, idx),
    array[idx + 1],
    array[idx],
    ...array.slice(idx + 2),
]


export const arrSwap = (arr, idx) => {
    if (idx.length !== 2 || idx[0] === idx[1]) return arr

    idx.sort((a, b) => a - b)
    return trimFalsy([
        ...arr.slice(0, idx[0]),
        arr[idx[1]],
        ...arr.slice(idx[0] + 1, idx[1]),
        arr[idx[0]],
        ...arr.slice(idx[1] + 1),
    ])
}
