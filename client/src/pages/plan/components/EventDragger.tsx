import type { MouseEvent } from "react";
import type { EventData } from "types/models";
import DragBlock from "common/DragBlock/DragBlock";
import {
  DragBlockWrapper,
  dragEventStyle,
  DragIcon,
  OverlayButton,
  SideButton,
  SideButtonWrapper,
} from "../styles/PlanTabVoteStyles";
import { canDrop, dataType } from "../services/planVote.services";
import { arrayPad } from "../services/plan.utils";

type EventDraggerProps = {
  boxId: string;
  eventIds?: string[];
  slots?: number;
  events?: Record<string, EventData>;
  onDrop: (item: any) => void;
  onClick: (
    event: MouseEvent,
    id: string,
    slot: number,
    action: number,
  ) => void;
  numberSlots?: boolean;
};

export default function EventDragger({
  boxId,
  eventIds,
  slots = 0,
  events,
  onDrop,
  onClick,
  numberSlots,
}: EventDraggerProps) {
  return (
    <>
      {arrayPad(eventIds, slots).map((id: string, slot?: number) => (
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
              <OverlayButton
                onClick={id ? (ev) => onClick(ev, id, 1, 1) : undefined}
              >
                ✕
              </OverlayButton>
            )}
            {id && <DragIcon />}
          </DragBlock>

          {numberSlots ? (
            <SideButtonWrapper hide={!id}>
              <SideButton
                onClick={
                  id && slot !== undefined && slot > 0
                    ? (ev) => onClick(ev, id, slot, -1)
                    : undefined
                }
              >
                ▲
              </SideButton>
              <SideButton
                onClick={
                  id && slot !== undefined && slot < slots - 1
                    ? (ev) => onClick(ev, id, slot, 1)
                    : undefined
                }
              >
                ▼
              </SideButton>
            </SideButtonWrapper>
          ) : (
            <SideButtonWrapper hide={!id}>
              <SideButton
                onClick={id ? (ev) => onClick(ev, id, -1, -1) : undefined}
              >
                ＋
              </SideButton>
            </SideButtonWrapper>
          )}
        </DragBlockWrapper>
      ))}
    </>
  );
}
