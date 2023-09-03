import { fetchApi, getTags, usePlayerQuery, useEventQuery, useSettingsQuery } from '../common/common.fetch'
import { addUpdate, removeUpdate, voterUpdate } from './services/voterFetch.services'
import { useUpdateSettingsMutation } from '../settings/settings.fetch'
import { debugLogging } from '../../assets/config'

export const voterApi = fetchApi.injectEndpoints({
  endpoints: (build) => ({
    
    voter:  build.query({
        query: (id=null) => `voter/${id || 'all'}`,
        transformResponse: debugLogging ? (res) => console.log('VOTE',res) || res : undefined,
        providesTags: getTags('Voter'),
    }),

    updateVoter: build.mutation({
        query: ({ id, ...body }) => ({ url: `voter/${id}`, method: 'PATCH', body }),
        transformResponse: debugLogging ? res => console.log('UPD_VOTE',res) || res : undefined,
        invalidatesTags: getTags('Voter',{all:0}),
        onQueryStarted: voterUpdate,
    }),

    addVoter: build.mutation({
        query: (id) => ({ url: `voter`, method: 'POST', body: { id }, }),
        transformResponse: debugLogging ? res => console.log('ADD_VOTE',res) || res : undefined,
        invalidatesTags: getTags('Voter'),
        onQueryStarted: addUpdate,
    }),

    rmvVoter: build.mutation({
        query: (id) => ({ url: `voter/${id}`, method: 'DELETE' }),
        transformResponse: debugLogging ? res => console.log('DEL_VOTE',res) || res : undefined,
        invalidatesTags: getTags('Voter'),
        onQueryStarted: removeUpdate,
    }),
    
  }),
  overrideExisting: true
})

export { useUpdateSettingsMutation, usePlayerQuery, useEventQuery, useSettingsQuery }
export const { useVoterQuery, useUpdateVoterMutation, useAddVoterMutation, useRmvVoterMutation } = voterApi
