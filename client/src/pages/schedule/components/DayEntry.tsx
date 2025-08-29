import type { EventData } from "../../../types/models";
import DragBlock from "../../common/DragBlock";
import {
  CollapseContainer,
  dragAndDropClass,
  EditEventButton,
  EntryLinkStyle,
  EntryTitleStyle,
  MissingDataStyle,
  NoPlayerStyle,
  PlayerListStyle,
  PlayerNameStyle,
} from "../styles/DayStyles";

import { usePrefetchEvent } from "../schedule.fetch";
import { isTempId } from "../services/date.utils";
import { canDrop, dataType } from "../services/day.services";
import { useLinkId } from "../../common/services/idUrl.services";
import { usePlayerQuery } from "../../common/common.fetch";

type DayEntryProps = {
  day: string;
  slot?: number;
  id?: string;
  data?: EventData;
  isEditing?: boolean;
  dropHandler?: (item: any) => void;
  editEvent?: () => void;
  showPlayers?: boolean;
  expandAll?: boolean;
};

export default function DayEntry({
  day,
  slot,
  id,
  data,
  isEditing,
  dropHandler,
  editEvent,
  showPlayers = false,
  expandAll = false,
}: DayEntryProps) {
  const { data: players } = usePlayerQuery(undefined, { skip: !showPlayers });

  // Setup prefetching
  const prefetch = usePrefetchEvent();
  const loadEvent = (id?: string) => id && (() => prefetch(id));
  const eventUrl = useLinkId(id, "event/");

  if (id && isTempId(id)) return <MissingDataStyle>...</MissingDataStyle>;

  return (
    <CollapseContainer
      open={expandAll}
      enabled={showPlayers}
      content={
        players &&
        data?.players && (
          <PlayerListStyle>
            {data.players.map((pid) => (
              <PlayerNameStyle key={pid}>
                {players[pid]?.name || pid}
              </PlayerNameStyle>
            ))}

            {!data.players.length && <NoPlayerStyle />}
          </PlayerListStyle>
        )
      }
    >
      <DragBlock
        type={dataType}
        item={{ id, day, slot }}
        onDrop={dropHandler}
        dropCheck={canDrop}
        className={dragAndDropClass.inner}
        disabled={!isEditing}
        draggable={Boolean(data)}
        onHover={loadEvent(id)}
      >
        {!data ? (
          <div />
        ) : isEditing ? (
          <>
            <EntryTitleStyle status={data.status}>{data.title}</EntryTitleStyle>

            {data.status < 3 && (
              <EditEventButton status={data.status} onClick={editEvent} />
            )}
          </>
        ) : (
          <EntryLinkStyle
            to={showPlayers ? undefined : eventUrl}
            status={data.status}
          >
            {data.title}
          </EntryLinkStyle>
        )}
      </DragBlock>
    </CollapseContainer>
  );
}
