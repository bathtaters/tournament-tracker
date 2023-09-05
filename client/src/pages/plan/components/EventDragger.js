import React from "react"
import PropTypes from "prop-types"
import DragBlock from '../../common/DragBlock'
import { DragBlockWrapper, dragEventStyle } from "../styles/PlanTabVoteStyles"
import { canDrop, dataType } from "../services/planVote.services"
import { arrayPad } from "../services/plan.utils"


function EventDragger({ boxId, eventIds, slots, events, onDrop, numberSlots }) {

    return (<>
        { arrayPad(eventIds, slots || 0).map((id,slot) => 
            <DragBlockWrapper number={numberSlots && slot + 1}>

                <DragBlock
                    type={dataType}
                    item={{ id, boxId, slot }}
                    onDrop={onDrop}
                    dropCheck={canDrop}
                    className={dragEventStyle(id && boxId)}
                    draggable={Boolean(id)}
                    key={id || slot}
                >
                    {id && events?.[id]?.title}
                </DragBlock>

            </DragBlockWrapper>
        )}
    </>)
}

EventDragger.propTypes = {
    boxId: PropTypes.string.isRequired,
    eventIds: PropTypes.arrayOf(PropTypes.string),
    events: PropTypes.object,
    slots: PropTypes.number,
    onDrop: PropTypes.func.isRequired,
    numberSlots: PropTypes.bool,
}

export default EventDragger