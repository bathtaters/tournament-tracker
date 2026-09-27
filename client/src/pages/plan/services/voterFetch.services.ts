import type { EventData, Schedule, Voter } from "types/models";
import type { MutateApi } from "types/helpers";
import { getCachedArgs } from "../../../core/services/global.services";
import { commonApi } from "../../../common/General/common.fetch";
import { noDate } from "../../schedule/services/date.utils";

type Voters = Record<Voter["id"], Voter>;
type Events = Record<EventData["id"], EventData>;

const newVoter = (id: Voter["id"], idx = 0): Voter => ({
  id,
  idx,
  days: [],
  events: [],
});

/* NOTE: All 'as any' in this file are to prevent a circular dependency w/ voter.fetch.ts */

export function voterUpdate(
  { id, ...body }: Voter,
  { dispatch, queryFulfilled }: MutateApi<Voter>,
) {
  const updateAll = dispatch(
    commonApi.util.updateQueryData(
      "voter" as any,
      undefined,
      (draft: Voters) => {
        Object.assign(draft[id], body);
      },
    ),
  );

  const updateOne = dispatch(
    commonApi.util.updateQueryData("voter" as any, id, (draft: Voter) => ({
      ...draft,
      ...body,
    })),
  );

  queryFulfilled.catch(() => {
    updateAll.undo();
    updateOne.undo();
  }); // rollback
}

export function updateVoters(
  voters: Voter["id"][],
  { dispatch, queryFulfilled, getState }: MutateApi<Voter["id"][]>,
) {
  const updateAll = dispatch(
    commonApi.util.updateQueryData(
      "voter" as any,
      undefined,
      (draft: Voters) => {
        Object.keys(draft).forEach((id) => {
          if (!voters.includes(id)) delete draft[id];
        });
        voters.forEach((id, idx) => {
          if (!draft[id]) draft[id] = newVoter(id, idx + 1);
          else draft[id].idx = idx + 1;
        });
      },
    ),
  );

  const updateOne = getCachedArgs(getState() as any, "voter").map(
    (voter: Voter["id"]) =>
      dispatch(
        commonApi.util.updateQueryData(
          "voter" as any,
          voter,
          (draft: Voter) => {
            if (!voters.includes(voter)) draft = null;
          },
        ),
      ),
  );

  queryFulfilled.catch(() => {
    updateAll.undo();
    updateOne.forEach((update) => update.undo());
  }); // rollback
}

export function updateEvents(
  events: EventData["id"][],
  { dispatch, queryFulfilled, getState }: MutateApi<EventData["id"][]>,
) {
  const updateAll = dispatch(
    commonApi.util.updateQueryData("event", undefined, (draft: Events) => {
      Object.keys(draft).forEach((id) => {
        draft[id].plan = events.indexOf(id) + 1;
      });
    }),
  );

  const updateOne = getCachedArgs(getState() as any, "event").map(
    (event: EventData["id"]) =>
      dispatch(
        commonApi.util.updateQueryData("event", event, (draft: EventData) => {
          draft.plan = events.indexOf(event) + 1;
        }),
      ),
  );

  queryFulfilled.catch(() => {
    updateAll.undo();
    updateOne.forEach((update) => update.undo());
  }); // rollback
}

export function updatePlanGen(
  _: void,
  { dispatch, queryFulfilled }: MutateApi<void>,
) {
  const updateSettings = dispatch(
    commonApi.util.updateQueryData("settings", undefined, (draft) => ({
      ...draft,
      planstatus: 3,
    })),
  );
  dispatch(
    commonApi.util.updateQueryData(
      "planStatus" as any,
      undefined,
      (draft: { planprogress?: number }) => ({
        ...draft,
        planprogress: 0,
      }),
    ),
  );
  queryFulfilled.catch(() => {
    updateSettings.undo();
  }); // rollback
}

export function updatePlanSave(
  _: void,
  { dispatch, queryFulfilled, getState }: MutateApi<void>,
) {
  const updateSettings = dispatch(
    commonApi.util.updateQueryData("settings", undefined, (draft) => ({
      ...draft,
      planstatus: 0,
    })),
  );

  const updateEvents = dispatch(
    commonApi.util.updateQueryData("event", undefined, (draft: Events) => {
      Object.keys(draft).forEach((id) => {
        if (!draft[id].plan) draft[id].day = null;
        else draft[id].plan = false;
      });
    }),
  );

  const updateIndivEvents = getCachedArgs(getState() as any, "event").map(
    (event: EventData["id"]) =>
      dispatch(
        commonApi.util.updateQueryData("event", event, (draft: EventData) => {
          if (!draft.plan) draft.day = null;
          else draft.plan = false;
        }),
      ),
  );

  const updateSched = dispatch(
    commonApi.util.updateQueryData(
      "schedule" as any,
      false,
      (draft: Record<string, Schedule>) => {
        let events: EventData["id"][] = [];
        Object.keys(draft).forEach((key) => {
          events.push(...draft[key].events);
          draft[key].events = [];
        });
        draft[noDate].events = events;

        getCachedArgs(getState() as any, "event").forEach(
          (event: EventData) => {
            if (!events.includes(event.id) && draft[event.day]?.events)
              draft[event.day].events.push(event.id);
          },
        );
      },
    ),
  );

  const updatePlan = dispatch(
    commonApi.util.updateQueryData(
      "schedule" as any,
      true,
      (draft: Record<string, Schedule>) => {
        Object.keys(draft).forEach((key) => (draft[key].events = []));
      },
    ),
  );

  // rollback
  queryFulfilled.catch(() => {
    updateEvents.undo();
    updateSettings.undo();
    updateSched.undo();
    updatePlan.undo();
    updateIndivEvents.forEach((update) => update.undo());
  });
}

export function updatePlanReset(
  _: void,
  { dispatch, queryFulfilled, getState }: MutateApi<void>,
) {
  const updateEvents = dispatch(
    commonApi.util.updateQueryData("event", undefined, (draft: Events) => {
      Object.keys(draft).forEach((id) => {
        draft[id].plan = false;
      });
    }),
  );

  const updateIndivEvents = getCachedArgs(getState() as any, "event").map(
    (event: EventData["id"]) =>
      dispatch(
        commonApi.util.updateQueryData("event", event, (draft: EventData) => {
          draft.plan = false;
        }),
      ),
  );

  const updateSettings = dispatch(
    commonApi.util.updateQueryData("settings", undefined, (draft) => {
      delete draft.plandates;
      delete draft.planslots;
    }),
  );

  const updateVoters = dispatch(
    commonApi.util.updateQueryData("voter" as any, undefined, () => ({})),
  );

  const updateIndivVoters = getCachedArgs(getState() as any, "voter").map(
    (voter: Voter["id"]) =>
      dispatch(
        commonApi.util.updateQueryData("voter" as any, voter, () => ({})),
      ),
  );

  // rollback
  queryFulfilled.catch(() => {
    updateEvents.undo();
    updateSettings.undo();
    updateVoters.undo();
    updateIndivVoters.forEach((update) => update.undo());
    updateIndivEvents.forEach((update) => update.undo());
  });
}
