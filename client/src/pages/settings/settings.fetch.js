import { settingsUpdate } from "./services/settingsFetch.services";
import {
  fetchApi,
  tagTypes,
  useSettingsQuery,
  useForceRefetch,
  useFetchingProvider,
} from "../common/common.fetch";
import { debugLogging } from "../../assets/config";

export const headerApi = fetchApi.injectEndpoints({
  endpoints: (build) => ({
    updateSettings: build.mutation({
      query: (body) => ({ url: "settings", method: "PATCH", body }),
      transformResponse: debugLogging
        ? (res) => console.log("UPD_SETTINGS", res) || res
        : undefined,
      invalidatesTags: ["Settings", "Schedule"],
      onQueryStarted: settingsUpdate,
    }),

    // DEV ONLY
    resetDb: build.mutation({
      query: (full = false) => ({
        url: "reset" + (full ? "/full" : ""),
        method: "POST",
      }),
    }),
  }),
  overrideExisting: true,
});

export {
  fetchApi,
  tagTypes,
  useSettingsQuery,
  useForceRefetch,
  useFetchingProvider,
};
export const { useUpdateSettingsMutation, useResetDbMutation } = headerApi;
