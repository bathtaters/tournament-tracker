// React-specific createApi from RTK Query
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import getTags, { tagTypes, ALL_ID } from '../services/tags.services';

const apiVersion = 'v0';

// Base queries for api server
export const fetchApi = createApi({
  reducerPath: 'dbApi',
  baseQuery: fetchBaseQuery({ baseUrl: `/api/${apiVersion}/` }),
  tagTypes,
  endpoints: (build) => ({
    testApi:     build.query({ query: () => 'meta', }),
  }),
})

export { getTags, tagTypes, ALL_ID };
export const { usePrefetch, useTestApiQuery } = fetchApi;