import { fetchApi, getTags, usePlayerQuery, useEventQuery, useSettingsQuery } from '../common/common.fetch'
import { voterUpdate, updateVoters, updateEvents } from './services/voterFetch.services'
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

    setVoters: build.mutation({
        query: (voters) => ({ url: `voter`, method: 'POST', body: { voters }, }),
        transformResponse: debugLogging ? res => console.log('SET_VOTE',res) || res : undefined,
        invalidatesTags: getTags('Voter'),
        onQueryStarted: updateVoters,
    }),

    setEvents: build.mutation({
        query: (events) => ({ url: `event/plan`, method: 'POST', body: { events }, }),
        transformResponse: debugLogging ? res => console.log('SET_PLAN',res) || res : undefined,
        invalidatesTags: getTags('Event'),
        onQueryStarted: updateEvents,
    }),
  }),
  overrideExisting: true
})

export { useUpdateSettingsMutation, usePlayerQuery, useEventQuery, useSettingsQuery }
export const { useVoterQuery, useUpdateVoterMutation, useSetVotersMutation, useSetEventsMutation } = voterApi
