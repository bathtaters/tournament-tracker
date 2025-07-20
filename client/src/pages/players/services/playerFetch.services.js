import { fetchApi } from "../../common/common.fetch";
import { nextTempId } from "../../common/services/basic.services";

export function playerUpdate({ id, ...body }, { dispatch, queryFulfilled }) {
  const updateAll = dispatch(
    fetchApi.util.updateQueryData("player", undefined, (draft) => {
      Object.assign(draft[id], body);
    })
  );
  const updateOne = dispatch(
    fetchApi.util.updateQueryData("player", id, (draft) => {
      Object.assign(draft, body);
    })
  );
  queryFulfilled.catch(() => {
    updateAll.undo();
    updateOne.undo();
  }); // rollback
}

export function createUpdate(body, { dispatch, getState, queryFulfilled }) {
  const stats = getState().dbApi.queries["stats(undefined)"];
  const id = nextTempId("PLAYER", stats && stats.data && stats.data.ranking);
  const updatePlayer = dispatch(
    fetchApi.util.updateQueryData("player", undefined, (draft) => {
      draft[id] = body;
    })
  );
  const updateStats = dispatch(
    fetchApi.util.updateQueryData("stats", undefined, (draft) => {
      draft.ranking.push(id);
    })
  );
  queryFulfilled.catch(() => {
    updatePlayer.undo();
    updateStats.undo();
  }); // rollback
}

export function deleteUpdate(id, { dispatch, queryFulfilled }) {
  const updatePlayer = dispatch(
    fetchApi.util.updateQueryData("player", undefined, (draft) => {
      delete draft[id];
    })
  );
  const updateStats = dispatch(
    fetchApi.util.updateQueryData("stats", undefined, (draft) => {
      const idx = draft.ranking ? draft.ranking.indexOf(id) : -1;
      if (idx > -1) draft.ranking.splice(idx, 1);
      delete draft[id];
    })
  );
  queryFulfilled.catch(() => {
    updatePlayer.undo();
    updateStats.undo();
  }); // rollback
}
