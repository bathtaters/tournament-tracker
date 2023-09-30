import React from "react"
import Modal from "../../common/Modal"
import EditableList from "../../common/EditableList/EditableList"
import EditEvent from "../../eventEditor/EditEvent"
import useEventList from "../services/eventList.controller"

function EventList({ value, onChange }) {
    const { modal, editId, listProps } = useEventList(value, onChange)
    
    return (<>
        <EditableList type="Event" {...listProps} />

        <Modal ref={modal}>
            <EditEvent modal={modal} eventid={editId} hidePlayers={true} onDeleteRedirect="/plan" />
        </Modal>
    </>)
}

export default EventList