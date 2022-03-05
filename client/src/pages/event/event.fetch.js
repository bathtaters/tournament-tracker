import { 
  fetchApi, getTags,
  useEventQuery, usePlayerQuery,
  useSettingsQuery, useStatsQuery
} from '../common/common.fetch';

import { nextRoundUpdate, clearRoundUpdate } from './services/eventFetch.services'

export const eventApi = fetchApi.injectEndpoints({
  endpoints: (build) => ({

    nextRound: build.mutation({
      query: id => ({ url: `event/${id}/round`, method: 'POST' }),
      transformResponse: res => console.log('ROUND+',res) || res,
      invalidatesTags: getTags(['Event','Match','Stats'], {all:0,addBase:['PlayerDetail']}),
      onQueryStarted: nextRoundUpdate,
    }),

    clearRound: build.mutation({
      query: id => ({ url: `event/${id}/round`, method: 'DELETE' }),
      transformResponse: res => console.log('ROUND-',res) || res,
      invalidatesTags: getTags(['Event','Match','Stats'], {all:0,addBase:['PlayerDetail']}),
      onQueryStarted: clearRoundUpdate,
    }),

  }),
  overrideExisting: true
});
const refetchStats = (id) => fetchApi.util.invalidateTags(getTags('Stats')({id}))

export { useEventQuery, usePlayerQuery, useSettingsQuery, useStatsQuery, refetchStats };
export const { useNextRoundMutation, useClearRoundMutation } = eventApi;