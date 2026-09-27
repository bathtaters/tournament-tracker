import type { EventData, Team } from "types/models";
import {
  commonApi,
  getTags,
  useEventQuery,
  usePlayerQuery,
  useSettingsQuery,
  useTeamQuery,
} from "../../common/General/common.fetch";
import {
  deleteUpdate,
  eventSet,
  teamDelete,
  teamSet,
} from "./services/eventEditorFetch.services";
import { useCreatePlayerMutation } from "../players/player.fetch";
import { debugLogging } from "../../assets/config";

export const eventEditorApi = commonApi.injectEndpoints({
  endpoints: (build) => ({
    setEvent: build.mutation<any, Partial<EventData>>({
      query: ({ id, ...body }) =>
        id
          ? { url: `event/${id}`, method: "PATCH", body }
          : { url: `event`, method: "POST", body },
      transformResponse: debugLogging
        ? (res: any) => {
            console.log("SET_EVENT", res);
            return res;
          }
        : undefined,
      invalidatesTags: getTags(["Event", "Stats", "Clock"], {
        addBase: ["Schedule", { type: "Stats", id: "TOTAL" }],
      }),
      onQueryStarted: eventSet,
    }),

    deleteEvent: build.mutation<any, EventData["id"]>({
      query: (id) => ({ url: `event/${id}`, method: "DELETE" }),
      transformResponse: debugLogging
        ? (res: any) => {
            console.log("DEL_EVENT", res);
            return res;
          }
        : undefined,
      invalidatesTags: getTags(["Event", "Stats"], {
        addBase: ["Schedule", { type: "Stats", id: "TOTAL" }],
      }),
      onQueryStarted: deleteUpdate,
    }),

    setTeam: build.mutation<any, Partial<Team> & { _tempId?: string }>({
      query: ({ id, _tempId, ...body }) =>
        id
          ? { url: `team/${id}`, method: "PATCH", body }
          : { url: `team`, method: "POST", body },
      transformResponse: debugLogging
        ? (res: any) => {
            console.log("SET_TEAM", res);
            return res;
          }
        : undefined,
      invalidatesTags: getTags(["Team"]),
      onQueryStarted: teamSet,
    }),

    deleteTeam: build.mutation<any, Team["id"]>({
      query: (id) => ({ url: `team/${id}`, method: "DELETE" }),
      transformResponse: debugLogging
        ? (res: any) => {
            console.log("DEL_TEAM", res);
            return res;
          }
        : undefined,
      invalidatesTags: getTags(["Team"]),
      onQueryStarted: teamDelete,
    }),
  }),
  overrideExisting: true,
});

export {
  useEventQuery,
  usePlayerQuery,
  useTeamQuery,
  useSettingsQuery,
  useCreatePlayerMutation,
};
export const {
  useSetEventMutation,
  useDeleteEventMutation,
  useSetTeamMutation,
  useDeleteTeamMutation,
} = eventEditorApi;
