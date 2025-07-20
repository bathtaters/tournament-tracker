import { getCachedArgs } from "../../../core/services/global.services";
import { fetchApi } from "../../common/common.fetch";
import { noDate } from "../../schedule/services/date.utils";

const newVoter = (id, idx = 0) => ({ id, idx, dates: [], games: [] });

export function voterUpdate({ id, ...body }, { dispatch, queryFulfilled }) {
  const updateAll = dispatch(
    fetchApi.util.updateQueryData("voter", undefined, (draft) => {
      Object.assign(draft[id], body);
    })
  );

  const updateOne = dispatch(
    fetchApi.util.updateQueryData("voter", id, (draft) => ({
      ...draft,
      ...body,
    }))
  );

  queryFulfilled.catch(() => {
    updateAll.undo();
    updateOne.undo();
  }); // rollback
}

export function updateVoters(voters, { dispatch, queryFulfilled, getState }) {
  const updateAll = dispatch(
    fetchApi.util.updateQueryData("voter", undefined, (draft) => {
      Object.keys(draft).forEach((id) => {
        if (!voters.includes(id)) delete draft[id];
      });
      voters.forEach((id, idx) => {
        if (!draft[id]) draft[id] = newVoter(id, idx + 1);
        else draft[id].idx = idx + 1;
      });
    })
  );

  const updateOne = getCachedArgs(getState(), "voter").map((voter) =>
    dispatch(
      fetchApi.util.updateQueryData("voter", voter, (draft) => {
        if (!voters.includes(voter)) draft = null;
      })
    )
  );

  queryFulfilled.catch(() => {
    updateAll.undo();
    updateOne.forEach((update) => update.undo());
  }); // rollback
}

export function updateEvents(events, { dispatch, queryFulfilled, getState }) {
  const updateAll = dispatch(
    fetchApi.util.updateQueryData("event", undefined, (draft) => {
      Object.keys(draft).forEach((id) => {
        draft[id].plan = events.indexOf(id) + 1;
      });
    })
  );

  const updateOne = getCachedArgs(getState(), "event").map((event) =>
    dispatch(
      fetchApi.util.updateQueryData("event", event, (draft) => {
        draft.plan = events.indexOf(event) + 1;
      })
    )
  );

  queryFulfilled.catch(() => {
    updateAll.undo();
    updateOne.forEach((update) => update.undo());
  }); // rollback
}

export function updatePlanGen(_, { dispatch, queryFulfilled }) {
  const updateSettings = dispatch(
    fetchApi.util.updateQueryData("settings", undefined, (draft) => ({
      ...draft,
      planstatus: 3,
    }))
  );
  dispatch(
    fetchApi.util.updateQueryData("planStatus", undefined, (draft) => ({
      ...draft,
      planprogress: 0,
    }))
  );
  queryFulfilled.catch(() => {
    updateSettings.undo();
  }); // rollback
}

export function updatePlanSave(_, { dispatch, queryFulfilled, getState }) {
  const updateSettings = dispatch(
    fetchApi.util.updateQueryData("settings", undefined, (draft) => ({
      ...draft,
      planstatus: 0,
    }))
  );

  const updateEvents = dispatch(
    fetchApi.util.updateQueryData("event", undefined, (draft) => {
      Object.keys(draft).forEach((id) => {
        if (!draft[id].plan) draft[id].day = null;
        else draft[id].plan = false;
      });
    })
  );

  const updateIndivEvents = getCachedArgs(getState(), "event").map((event) =>
    dispatch(
      fetchApi.util.updateQueryData("event", event, (draft) => {
        if (!draft.plan) draft.day = null;
        else draft.plan = false;
      })
    )
  );

  const updateSched = dispatch(
    fetchApi.util.updateQueryData("schedule", false, (draft) => {
      let events = [];
      Object.keys(draft).forEach((key) => {
        events.push(...draft[key].events);
        draft[key].events = [];
      });
      draft[noDate].events = events;

      const allevents = getCachedArgs(getState(), "event");
      console.log("UPDATE SCHED", events, allevents);

      getCachedArgs(getState(), "event").forEach((event) => {
        if (!events.includes(event.id) && draft[event.day]?.events)
          draft[event.day].events.push(event.id);
      });
    })
  );

  const updatePlan = dispatch(
    fetchApi.util.updateQueryData("schedule", true, (draft) => {
      Object.keys(draft).forEach((key) => (draft[key].events = []));
    })
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

export function updatePlanReset(_, { dispatch, queryFulfilled, getState }) {
  const updateEvents = dispatch(
    fetchApi.util.updateQueryData("event", undefined, (draft) => {
      Object.keys(draft).forEach((id) => {
        draft[id].plan = false;
      });
    })
  );

  const updateIndivEvents = getCachedArgs(getState(), "event").map((event) =>
    dispatch(
      fetchApi.util.updateQueryData("event", event, (draft) => {
        draft.plan = false;
      })
    )
  );

  const updateSettings = dispatch(
    fetchApi.util.updateQueryData("settings", undefined, (draft) => {
      delete draft.plandates;
      delete draft.planslots;
    })
  );

  const updateVoters = dispatch(
    fetchApi.util.updateQueryData("voter", undefined, () => ({}))
  );

  const updateIndivVoters = getCachedArgs(getState(), "voter").map((voter) =>
    dispatch(fetchApi.util.updateQueryData("voter", voter, () => ({})))
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
