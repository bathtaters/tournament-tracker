
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
    let date = new Date(dateArr[0])
    const end = new Date(dateArr[1])
    
    let arr = []
    while (date <= end) {
        arr.push(date.toISOString().slice(0,10))
        date.setDate(date.getDate() + 1)
    }
    return arr
}
