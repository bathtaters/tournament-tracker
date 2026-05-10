import type { MatchData, MatchReport } from "types/models";
import type { MutateApi } from "types/helpers";
import type {
  SwapPlayerBody,
  UpdateDropBody,
  UpdateMatchBody,
} from "types/api";
import { commonApi } from "../../../common/General/common.fetch";
import { moveDrops, swapPlayerArrays } from "./swap.services";

export function reportUpdate(
  { id, eventid, clear = false, ...body }: MatchReport,
  { dispatch, queryFulfilled }: MutateApi<MatchReport>,
) {
  const update = dispatch(
    commonApi.util.updateQueryData(
      "match" as any,
      eventid,
      (draft: Record<MatchData["id"], MatchData>) => {
        if (clear) {
          // Clear match
          draft[id].reported = false;
          draft[id].drops = [];
        } else {
          // Report match
          Object.assign(draft[id], body, { reported: true });
        }
      },
    ),
  );
  queryFulfilled.catch(update.undo); // rollback
}

export function dropsUpdate(
  { id, eventid, playerid, undrop }: UpdateDropBody,
  { dispatch, queryFulfilled }: MutateApi<UpdateDropBody>,
) {
  const update = dispatch(
    commonApi.util.updateQueryData(
      "match" as any,
      eventid,
      (draft: Record<MatchData["id"], MatchData>) => {
        // Add playerId to the match.drops array
        if (!undrop) draft[id].drops.push(playerid);
        // Remove playerId from match.drops array
        else draft[id].drops.splice(draft[id].drops.indexOf(playerid), 1);
      },
    ),
  );
  queryFulfilled.catch(update.undo); // rollback
}

export function matchUpdate(
  { id, eventid, ...body }: UpdateMatchBody,
  { dispatch, queryFulfilled }: MutateApi<UpdateMatchBody>,
) {
  const update = dispatch(
    commonApi.util.updateQueryData(
      "match" as any,
      eventid,
      (draft: Record<MatchData["id"], MatchData>) => {
        const idx = body.key.match(/^wins\.(\d+)$/); // check for changed 'wins'
        // update 'wins' value
        if (idx) draft[id].wins[+idx[1]] = +body.value;
        // update 'draws' value
        else if (body.key === "draws") draft[id].draws = +body.value;
      },
    ),
  );
  queryFulfilled.catch(update.undo); // rollback
}

export function swapPlayersUpdate(
  { id, eventid, ...body }: SwapPlayerBody,
  { dispatch, queryFulfilled }: MutateApi<SwapPlayerBody>,
) {
  const update = dispatch(
    commonApi.util.updateQueryData(
      "match" as any,
      eventid,
      (draft: Record<MatchData["id"], MatchData>) => {
        // Get player match-indexes
        const idx = [...Array(2)].map((_, i) =>
          draft[body.swap[i].id].players.indexOf(body.swap[i].playerid),
        ) as [number, number];
        // Check if either player has a bye
        const isBye: boolean = body.swap?.some(
          ({ id }) => draft[id]?.players?.length === 1,
        );

        // If both players have indexes...
        if (idx.every((i) => i !== -1)) {
          // Swap player names
          swapPlayerArrays(draft, body.swap, idx, "players");

          // If neither player has a bye, swap their wins
          if (!isBye) swapPlayerArrays(draft, body.swap, idx, "wins");

          // Swap players' drop statuses
          moveDrops(
            draft,
            body.swap[0].id,
            body.swap[1].id,
            body.swap[0].playerid,
          );
          moveDrops(
            draft,
            body.swap[1].id,
            body.swap[0].id,
            body.swap[1].playerid,
          );
        }
      },
    ),
  );
  queryFulfilled.catch(update.undo); // rollback
}
