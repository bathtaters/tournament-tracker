import React, { useCallback } from "react"
import PropTypes from "prop-types"
import { DateSelectButton, DateSelectWrapper } from "../styles/DateMultiSelectStyles"
import { addOrRemove, formatDate, useDateRangeList } from "../services/plan.utils"


function DateMultiSelect({ range, value, onChange }) {
    const dateList = useDateRangeList(range || [])

    const updateSelected = useCallback(
        (idx) => onChange(addOrRemove([dateList[idx]])),
        [dateList, onChange]
    )

    return (
        <DateSelectWrapper>
            {dateList.map((date, idx) => (
                <DateSelectButton
                    idx={idx}
                    value={value.includes(date)}
                    onChange={updateSelected}
                    key={date}
                >
                    {formatDate(date)}
                </DateSelectButton>
            ))}
        </DateSelectWrapper>
    )
}

DateMultiSelect.propTypes = {
    range: PropTypes.arrayOf(PropTypes.string),
    value: PropTypes.string,
    onChange: PropTypes.func,
}

export default DateMultiSelect