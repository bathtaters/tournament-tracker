import {
  fetchApi,
  useEventQuery,
  useSettingsQuery,
} from "../common/common.fetch";
import { usePrefetchEvent } from "../common/common.hooks";
import { scheduleAdapter } from "./services/scheduleFetch.services";
import { useSetEventMutation } from "../eventEditor/eventEditor.fetch";

export const scheduleApi = fetchApi.injectEndpoints({
  endpoints: (build) => ({
    schedule: build.query({
      query: (isPlan) => `schedule${isPlan ? "/plan" : ""}`,
      transformResponse: scheduleAdapter,
      providesTags: ["Schedule"],
    }),
  }),
  overrideExisting: true,
});

export {
  useEventQuery,
  useSettingsQuery,
  useSetEventMutation,
  usePrefetchEvent,
};
export const { useScheduleQuery } = scheduleApi;
