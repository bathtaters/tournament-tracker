import type { Player, Stats } from "types/models";
import type { MutateApi } from "types/helpers";
import { commonApi } from "../../../common/General/common.fetch";
import { nextTempId } from "../../../common/General/services/basic.services";

type Players = Record<Player["id"], Player>;

export function playerUpdate(
  { id, ...body }: Player,
  { dispatch, queryFulfilled }: MutateApi<Players>,
) {
  const updateAll = dispatch(
    commonApi.util.updateQueryData("player", undefined, (draft: Players) => {
      Object.assign(draft[id], body);
    }),
  );
  const updateOne = dispatch(
    commonApi.util.updateQueryData("player", id, (draft: Player) => {
      Object.assign(draft, body);
    }),
  );
  queryFulfilled.catch(() => {
    updateAll.undo();
    updateOne.undo();
  }); // rollback
}

export function createUpdate(
  body: Player,
  { dispatch, getState, queryFulfilled }: MutateApi<Players>,
) {
  const stats = getState().dbApi.queries["stats(undefined)"];
  const id = nextTempId("PLAYER", (stats?.data as Stats)?.ranking);
  const updatePlayer = dispatch(
    commonApi.util.updateQueryData("player", undefined, (draft: Players) => {
      draft[id] = body;
    }),
  );
  const updateStats = dispatch(
    commonApi.util.updateQueryData("stats", undefined, (draft: Stats) => {
      draft.ranking.push(id);
    }),
  );
  queryFulfilled.catch(() => {
    updatePlayer.undo();
    updateStats.undo();
  }); // rollback
}

export function deleteUpdate(
  id: Player["id"],
  { dispatch, queryFulfilled }: MutateApi<Players>,
) {
  const updatePlayer = dispatch(
    commonApi.util.updateQueryData("player", undefined, (draft: Players) => {
      delete draft[id];
    }),
  );
  const updateStats = dispatch(
    commonApi.util.updateQueryData("stats", undefined, (draft: Stats) => {
      const idx = draft.ranking ? draft.ranking.indexOf(id) : -1;
      if (idx > -1) draft.ranking.splice(idx, 1);
      delete draft[id];
    }),
  );
  queryFulfilled.catch(() => {
    updatePlayer.undo();
    updateStats.undo();
  }); // rollback
}
