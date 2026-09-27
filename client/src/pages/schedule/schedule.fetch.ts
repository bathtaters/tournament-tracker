import { commonApi } from "../../common/General/common.fetch";
import { scheduleAdapter } from "./services/scheduleFetch.services";

export const scheduleApi = commonApi.injectEndpoints({
  endpoints: (build) => ({
    schedule: build.query({
      query: (isPlan) => `schedule${isPlan ? "/plan" : ""}`,
      transformResponse: scheduleAdapter,
      providesTags: ["Schedule"],
    }),
  }),
  overrideExisting: true,
});

export const { useScheduleQuery } = scheduleApi;

export {
  useEventQuery,
  useSettingsQuery,
} from "../../common/General/common.fetch";
export { usePrefetchEvent } from "../../common/General/common.hooks";
export { useSetEventMutation } from "../eventEditor/eventEditor.fetch";
