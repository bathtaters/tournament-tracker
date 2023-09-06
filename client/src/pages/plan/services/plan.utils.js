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



const lastTruthyIndex = (array) => {
    for (let i = array.length - 2; i >= 0; i--) { if (array[i]) return i }
    return -1
}

export const arrRemove = (array, idx) => idx === array.length - 1 ?
    array.slice(0, lastTruthyIndex(array) + 1) :
    arrInsert(array, idx)


export const arrInsert = (array, idx, value) => idx <= array.length ? [
    ...array.slice(0, idx),
    value,
    ...array.slice(idx + 1),
] : [
    ...arrayPad(array, idx),
    value,
]

export const arrSwap = (arr, idx) => {
    if (idx.length !== 2 || idx[0] === idx[1]) return arr

    idx.sort((a, b) => a - b)
    return [
        ...arr.slice(0, idx[0]),
        arr[idx[1]],
        ...arr.slice(idx[0] + 1, idx[1]),
        arr[idx[0]],
        ...arr.slice(idx[1] + 1),
    ]
}
