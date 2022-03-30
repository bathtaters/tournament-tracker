import { 
  fetchApi, getTags,
  useEventQuery, usePlayerQuery,
  useSettingsQuery, useStatsQuery
} from '../common/common.fetch';
import { useSetEventMutation } from '../eventEditor/eventEditor.fetch';

import { nextRoundUpdate, clearRoundUpdate } from './services/eventFetch.services'

export const eventApi = fetchApi.injectEndpoints({
  endpoints: (build) => ({

    nextRound: build.mutation({
      query: id => ({ url: `event/${id}/round`, method: 'POST' }),
      transformResponse: res => console.log('ROUND+',res) || res,
      invalidatesTags: getTags(['Event','Match','Stats'], {all:0,addBase:['PlayerDetail'],addAll:['Stats']}),
      onQueryStarted: nextRoundUpdate,
    }),

    clearRound: build.mutation({
      query: id => ({ url: `event/${id}/round`, method: 'DELETE' }),
      transformResponse: res => console.log('ROUND-',res) || res,
      invalidatesTags: getTags(['Event','Match','Stats'], {all:0,addBase:['PlayerDetail'],addAll:['Stats']}),
      onQueryStarted: clearRoundUpdate,
    }),

  }),
  overrideExisting: true
});
const refetchStats = (id) => fetchApi.util.invalidateTags(getTags('Stats',{all:0})({id}))

export { useEventQuery, usePlayerQuery, useSettingsQuery, useStatsQuery, useSetEventMutation, refetchStats };
export const { useNextRoundMutation, useClearRoundMutation } = eventApi;