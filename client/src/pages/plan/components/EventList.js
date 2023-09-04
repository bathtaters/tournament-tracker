import React from "react"
import EditableList from "../../common/components/EditableList/EditableList"
import { useEventQuery } from "../voter.fetch"

function EventList({ value, onChange }) {
    
    const query = useEventQuery()

    const autofill = {
        label: `Fill ${query.data ? Object.keys(query.data).length : 'All'}`,
        onClick: () => { onChange(Object.keys(query.data)) },
    }

    return (
        <EditableList
            type="Event"
            value={value}
            onChange={onChange}
            nameKey="title"
            query={query}
            autofill={autofill}
            // create={create}
        />
    )
}

export default EventList