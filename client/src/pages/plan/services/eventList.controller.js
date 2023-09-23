import { useRef, useState } from "react"
import { useEventQuery } from "../voter.fetch"
import { useSetEventMutation } from "../../eventEditor/eventEditor.fetch"
import { createItemAlert, itemCreateError } from "../../../assets/alerts"
import { useLockScreen, useOpenAlert } from "../../common/common.hooks"
import { createLockCaption } from "../../../assets/constants"

export default function useEventList(value, onChange) {
    // Event Editor modal
    const modal = useRef(null)
    const [editId, setEditId] = useState(null)

     // Load DB
     const query = useEventQuery()
     const [ createEventMutation, { isLoading: isAddingEvent } ] = useSetEventMutation()
 
     // Init globals
     const openAlert = useOpenAlert()
     useLockScreen(isAddingEvent, createLockCaption('Event'))

    // Add new event to DB
    const createEvent = async (title) => {
        // Check for errors
        if (!title.trim()) return false

        // Confirm create
        const answer = await openAlert(createItemAlert('Event', title),0)
        if (!answer) return false

        // Create & Push event
        const eventData = { title }
        const result = await createEventMutation(eventData)
        if (result?.error || !result?.data?.id) throw itemCreateError('Event', result, eventData)
        return result.data
    }

    const filter = ({ status }) => status < 2

    return {
        modal,
        editId,

        listProps: {
            value,
            onChange,
            query,
            filter,
            nameKey: "title",

            onClick: (id) => () => { setEditId(id); modal.current.open() },

            autofill: {
                label: `Fill ${query.data ? Object.values(query.data).filter(filter).length : 'All'}`,
                onClick: () => { onChange(Object.keys(query.data).filter((id) => filter(query.data[id]))) },
            },

            create: {
                label: 'Add New...',
                mutation: createEvent,
                hideOnEmpty: true,
            },

        }
    }
}