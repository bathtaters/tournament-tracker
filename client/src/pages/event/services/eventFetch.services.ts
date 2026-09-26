import type { EventData } from "types/models";
import type { MutateApi } from "types/helpers";
import { commonApi } from "../../../common/General/common.fetch";
import { fakeRound } from "./event.services";

export function nextRoundUpdate(
  id: string,
  { dispatch, queryFulfilled }: MutateApi<EventData>,
) {
  const update = dispatch(
    commonApi.util.updateQueryData("event", id, (draft: EventData) => {
      if (draft.roundactive > draft.roundcount) return; // Handle error
      if (!draft.matches) draft.matches = []; // Handle no matches
      if (draft.status < 2) draft.status = 2; // Handle initial round

      // Add next round
      if (draft.roundactive++ < draft.roundcount)
        draft.matches.push(fakeRound(draft));
      // End draft + cancel update
      else draft.status = 3;
    }),
  );
  queryFulfilled.catch(update.undo); // rollback
}

export function clearRoundUpdate(
  id: string,
  { dispatch, queryFulfilled }: MutateApi<EventData>,
) {
  const update = dispatch(
    commonApi.util.updateQueryData("event", id, (draft: EventData) => {
      if (draft.roundactive < 1) return; // Handle error

      // Remove round
      draft.matches.pop();
      draft.roundactive = draft.matches.length;

      // Fix status on start/end event
      if (!draft.roundactive) draft.status = 1;
      else if (draft.status === 3) draft.status = 2;
    }),
  );
  queryFulfilled.catch(update.undo); // rollback
}

export async function clockUpdate(
  id: string,
  { dispatch, queryFulfilled }: MutateApi<EventData>,
) {
  try {
    const { data } = await queryFulfilled;

    if (data?.limit) {
      dispatch(
        commonApi.util.updateQueryData("event", id, (draft: EventData) => {
          draft.clocklimit = data.limit;
        }),
      );
      dispatch(
        commonApi.util.updateQueryData(
          "event",
          undefined,
          (draft: Record<string, EventData>) => {
            draft[id].clocklimit = data.limit;
          },
        ),
      );
    }
  } catch (error) {
    console.error("Error updating clock:", error);
  }
}
