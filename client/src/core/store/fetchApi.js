// React-specific createApi from RTK Query
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import getTags, { tagTypes, ALL_ID } from '../services/tags.services'
import valid from "../../assets/validation.json"

const apiVersion = valid.meta.apiVersion || 1;

// Base queries for api server
export const fetchApi = createApi({
  reducerPath: 'dbApi',
  baseQuery: fetchBaseQuery({ baseUrl: `/api/v${apiVersion}/` }),
  tagTypes,
  endpoints: (build) => ({
    testApi:     build.query({ query: () => 'meta', }),
  }),
})

export { getTags, tagTypes, ALL_ID }
export const { usePrefetch, useTestApiQuery } = fetchApi