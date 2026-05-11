import type { EventData, Schedule, Team } from "types/models";
import type { MutateApi } from "types/helpers";
import { commonApi } from "../../../common/General/common.fetch";
import { updateSchedule } from "../../schedule/services/scheduleFetch.services";
import { nextTempId } from "../../../common/General/services/basic.services";

// Update cache for new event
function createUpdate(
  body: Partial<EventData>,
  { dispatch, getState, queryFulfilled }: MutateApi<Partial<EventData>>,
) {
  const events = getState().dbApi.queries["event(undefined)"];
  const id = nextTempId("EVENT", events && Object.keys(events));
  const updateEvent = dispatch(
    commonApi.util.updateQueryData(
      "event" as any,
      undefined,
      (draft: Record<EventData["id"], EventData>) => ({
        ...draft,
        [id]: { ...body },
      }),
    ),
  );
  const updateSched = dispatch(
    commonApi.util.updateQueryData(
      "schedule" as any,
      undefined,
      (draft: Schedule) => updateSchedule(draft, id, body),
    ),
  );

  queryFulfilled.catch(() => {
    updateEvent.undo();
    updateSched.undo();
  }); // rollback
}

// Update cache for existing event
function eventUpdate(
  { id, ...body }: Partial<EventData>,
  { dispatch, queryFulfilled }: MutateApi<Partial<EventData>>,
) {
  const updateAll = dispatch(
    commonApi.util.updateQueryData(
      "event" as any,
      undefined,
      (draft: Record<EventData["id"], EventData>) => ({
        ...draft,
        [id]: { ...draft[id], ...body },
      }),
    ),
  );
  const updateOne = dispatch(
    commonApi.util.updateQueryData("event" as any, id, (draft: EventData) => ({
      ...draft,
      ...body,
    })),
  );
  const updateSched =
    "day" in body || "slot" in body
      ? dispatch(
          commonApi.util.updateQueryData(
            "schedule" as any,
            undefined,
            (draft: Schedule) => updateSchedule(draft, id, body),
          ),
        )
      : null;

  queryFulfilled.catch(() => {
    updateAll.undo();
    updateOne.undo();
    updateSched?.undo();
  }); // rollback
}

// Remove event from cache
export function deleteUpdate(
  id: EventData["id"],
  { dispatch, queryFulfilled }: MutateApi<EventData["id"]>,
) {
  const updateSched = dispatch(
    commonApi.util.updateQueryData(
      "schedule" as any,
      undefined,
      (draft: Schedule) => updateSchedule(draft, id),
    ),
  );
  const updateEvent = dispatch(
    commonApi.util.updateQueryData(
      "event" as any,
      undefined,
      (draft: Record<EventData["id"], EventData>) =>
        Object.fromEntries(Object.entries(draft).filter(([key]) => key !== id)),
    ),
  );

  queryFulfilled.catch(() => {
    updateEvent.undo();
    updateSched.undo();
  }); // rollback
}

// Pick create/update function based on body
export const eventSet = (
  body: Partial<EventData>,
  mutateApi: MutateApi<Partial<EventData>>,
) => (body.id ? eventUpdate(body, mutateApi) : createUpdate(body, mutateApi));

// Merge updates into an existing team (optimistic)
function teamUpdate(
  { id, ...body }: Partial<Team>,
  { dispatch, queryFulfilled }: MutateApi<Partial<Team>>,
) {
  const updateAll = dispatch(
    commonApi.util.updateQueryData(
      "team" as any,
      undefined,
      (draft: Record<Team["id"], Team>) => ({
        ...draft,
        [id]: { ...draft[id], ...body, id },
      }),
    ),
  );
  const updateOne = dispatch(
    commonApi.util.updateQueryData("team" as any, id, (draft: Team) => ({
      ...draft,
      ...body,
    })),
  );

  queryFulfilled.catch(() => {
    updateAll.undo();
    updateOne.undo();
  });
}

// Remove a team from the cache (optimistic)
export function teamDelete(
  id: Team["id"],
  { dispatch, queryFulfilled }: MutateApi<Team["id"]>,
) {
  const update = dispatch(
    commonApi.util.updateQueryData(
      "team" as any,
      undefined,
      (draft: Record<Team["id"], Team>) =>
        Object.fromEntries(Object.entries(draft).filter(([key]) => key !== id)),
    ),
  );

  queryFulfilled.catch(() => update.undo());
}

// Optimistic team update
export const teamSet = (
  body: Partial<Team>,
  mutateApi: MutateApi<Partial<Team>>,
) => {
  if (body.id) teamUpdate(body, mutateApi);
};
