
export const pickerDates = ({ datestart, dateend } = {}, { startDate, endDate } = {}) => ({
    startDate: startDate || datestart,
    endDate:   endDate   || dateend,
})

export function dateRangeToArr({ startDate, endDate }) {
    let date = new Date(startDate)
    const end = new Date(endDate)
    
    let arr = []
    while (date <= end) {
        arr.push(date.toISOString().slice(0,10))
        date.setDate(date.getDate() + 1)
    }
    return arr
}

export function dateArrToRange(dates) {
    let range = { startDate: dates[0], endDate: dates[0] }
    dates.forEach((date) => {
        if (date < range.startDate) range.startDate = date
        if (date > range.endDate)   range.endDate   = date
    })
    return range
}
