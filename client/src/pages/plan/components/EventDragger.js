import React from "react";
import PropTypes from "prop-types";
import DragBlock from "../../common/DragBlock";
import {
  DragBlockWrapper,
  dragEventStyle,
  SideButtonWrapper,
  SideButton,
  OverlayButton,
  DragIcon,
} from "../styles/PlanTabVoteStyles";
import { canDrop, dataType } from "../services/planVote.services";
import { arrayPad } from "../services/plan.utils";

function EventDragger({
  boxId,
  eventIds,
  slots,
  events,
  onDrop,
  onClick,
  numberSlots,
}) {
  const raiseEvent = (id, slot) =>
    id && slot > 0 ? (ev) => onClick(ev, id, slot, -1) : null;
  const lowerEvent = (id, slot) =>
    id && slot < slots - 1 ? (ev) => onClick(ev, id, slot, 1) : null;
  const rankEvent = (id) => id && ((ev) => onClick(ev, id, -1));
  const dropEvent = (id) => id && ((ev) => onClick(ev, id, 1));

  return (
    <>
      {arrayPad(eventIds, slots || 0).map((id, slot) => (
        <DragBlockWrapper number={numberSlots && slot + 1} key={id || slot}>
          <DragBlock
            type={dataType}
            item={{ id, boxId, slot }}
            onDrop={onDrop}
            dropCheck={canDrop}
            className={dragEventStyle(id && boxId)}
            draggable={Boolean(id)}
          >
            <span>{id && events?.[id]?.title}</span>
            {id && numberSlots && (
              <OverlayButton onClick={dropEvent(id)}>✕</OverlayButton>
            )}
            {id && <DragIcon />}
          </DragBlock>

          {numberSlots ? (
            <SideButtonWrapper hide={!id}>
              <SideButton onClick={raiseEvent(id, slot)}>▲</SideButton>
              <SideButton onClick={lowerEvent(id, slot)}>▼</SideButton>
            </SideButtonWrapper>
          ) : (
            <SideButtonWrapper hide={!id}>
              <SideButton onClick={rankEvent(id)}>＋</SideButton>
            </SideButtonWrapper>
          )}
        </DragBlockWrapper>
      ))}
    </>
  );
}

EventDragger.propTypes = {
  boxId: PropTypes.string.isRequired,
  eventIds: PropTypes.arrayOf(PropTypes.string),
  events: PropTypes.object,
  slots: PropTypes.number,
  onDrop: PropTypes.func.isRequired,
  numberSlots: PropTypes.bool,
};

export default EventDragger;
