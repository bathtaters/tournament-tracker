import { fetchApi } from "../../common/common.fetch";
import { fakeRound } from "./event.services";

export function nextRoundUpdate(id, { dispatch, queryFulfilled }) {
  const update = dispatch(
    fetchApi.util.updateQueryData("event", id, (draft) => {
      if (draft.roundactive > draft.roundcount) return; // Handle error
      if (!draft.matches) draft.matches = []; // Handle no matches
      if (draft.status < 2) draft.status = 2; // Handle initial round

      // Add next round
      if (draft.roundactive++ < draft.roundcount)
        draft.matches.push(fakeRound(draft));
      // End draft + cancel update
      else draft.status = 3;
    })
  );
  queryFulfilled.catch(update.undo); // rollback
}

export function clearRoundUpdate(id, { dispatch, queryFulfilled }) {
  const update = dispatch(
    fetchApi.util.updateQueryData("event", id, (draft) => {
      if (draft.roundactive < 1) return; // Handle error

      // Remove round
      draft.matches.pop();
      draft.roundactive = draft.matches.length;

      // Fix status on start/end event
      if (!draft.roundactive) draft.status = 1;
      else if (draft.status === 3) draft.status = 2;
    })
  );
  queryFulfilled.catch(update.undo); // rollback
}

export async function clockUpdate(id, { dispatch, queryFulfilled }) {
  try {
    const { data } = await queryFulfilled;

    if (data?.limit) {
      dispatch(
        fetchApi.util.updateQueryData("event", id, (draft) => {
          draft.clocklimit = data.limit;
        })
      );
      dispatch(
        fetchApi.util.updateQueryData("event", undefined, (draft) => {
          draft[id].clocklimit = data.limit;
        })
      );
    }
  } catch (error) {
    console.error("Error updating clock:", error);
  }
}
