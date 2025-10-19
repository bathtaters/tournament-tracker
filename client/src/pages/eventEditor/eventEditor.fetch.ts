import type { EventData } from "types/models";
import {
  commonApi,
  getTags,
  useEventQuery,
  usePlayerQuery,
  useSettingsQuery,
  useTeamQuery,
} from "../../common/General/common.fetch";
import { deleteUpdate, eventSet } from "./services/eventEditorFetch.services";
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
export const { useSetEventMutation, useDeleteEventMutation } = eventEditorApi;
