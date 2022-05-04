// React-specific createApi from RTK Query
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import getTags, { tagTypes, ALL_ID } from '../services/tags.services'
import { metadata } from "../services/validation.services"

// Base queries for api server
export const fetchApi = createApi({
  reducerPath: 'dbApi',
  baseQuery: fetchBaseQuery({ baseUrl: `/api/v${metadata?.apiVersion ?? 1}/` }),
  tagTypes,
  endpoints: (build) => ({
    testApi:     build.query({ query: () => 'meta', }),
  }),
})

export { getTags, tagTypes, ALL_ID }
export const { useTestApiQuery } = fetchApi