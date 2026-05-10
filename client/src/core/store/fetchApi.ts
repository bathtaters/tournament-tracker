// React-specific createApi from RTK Query
import Cookies from "js-cookie";
import {
  type BaseQueryFn,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { useSelector } from "react-redux";
import getTags, { ALL_ID, tagTypes } from "../services/tags.services";
import { metadata } from "../services/validation.services";
import { sessionCookie } from "../../assets/config";

const baseUrl = `/api/v${metadata?.apiVersion ?? 1}/`;

// Ensure that this browser has a session cookie before any requests can be made
const baseQueryWithCookie: BaseQueryFn = async (args, api, extraOptions) => {
  if (!Cookies.get(sessionCookie)) {
    // Fetch initial session cookie
    const res = await fetch(`${baseUrl}session`, { credentials: "include" });
    if (!Cookies.get(sessionCookie)) {
      const err = await res.text();
      console.error(
        "Request cancelled due to missing session cookie.",
        api.endpoint,
        res.status,
        err,
      );
      return { error: { status: 401, data: "Error setting session cookie" } };
    }
  }

  // Proceed with the request
  const baseQuery = fetchBaseQuery({ baseUrl, credentials: "include" });
  return baseQuery(args, api, extraOptions);
};

// Base queries for api server
export const fetchApi = createApi({
  reducerPath: "dbApi",
  baseQuery: baseQueryWithCookie,
  tagTypes,
  endpoints: (build) => ({
    testApi: build.query({ query: () => "meta" }),
  }),
});

/** Check if any functions are fetching */
export const useFetchingStatus = () =>
  useSelector((state: FetchState) => isFetching(state));

export { getTags, tagTypes, ALL_ID };
export const { useTestApiQuery } = fetchApi;

export const isFetching = (state: FetchState) =>
  Object.values(state[fetchApi.reducerPath].queries).some(
    (qry) => qry.status === "pending",
  );

export type FetchState = {
  [fetchApi.reducerPath]: ReturnType<typeof fetchApi.reducer>;
};
