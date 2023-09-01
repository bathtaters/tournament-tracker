import { 
  fetchApi, getTags,
  useEventQuery, usePlayerQuery,
  useSettingsQuery, useStatsQuery
} from '../common/common.fetch';
import { useMatchQuery } from '../match/match.fetch';
import { useSetEventMutation } from '../eventEditor/eventEditor.fetch';

import { nextRoundUpdate, clearRoundUpdate } from './services/eventFetch.services'
import { debugLogging } from '../../assets/config';

export const eventApi = fetchApi.injectEndpoints({
  endpoints: (build) => ({

    nextRound: build.mutation({
      query: ({ id, roundactive }) => ({ url: `event/${id}/round/${roundactive+1}`, method: 'POST' }),
      transformResponse: debugLogging ? res => console.log('ROUND+',res) || res : undefined,
      invalidatesTags: getTags(['Event','Match','Stats','PlayerMatch'], {all:0,addAll:['Stats']}),
      onQueryStarted: nextRoundUpdate,
    }),

    clearRound: build.mutation({
      query: ({ id, roundactive }) => ({ url: `event/${id}/round/${roundactive}`, method: 'DELETE' }),
      transformResponse: debugLogging ? res => console.log('ROUND-',res) || res : undefined,
      invalidatesTags: getTags(['Event','Match','Stats','PlayerMatch'], {all:0,addAll:['Stats']}),
      onQueryStarted: clearRoundUpdate,
    }),

  }),
  overrideExisting: true
});
const refetchStats = (id) => fetchApi.util.invalidateTags(getTags('Stats',{all:0})({id}))

export { useEventQuery, usePlayerQuery, useSettingsQuery, useStatsQuery, useSetEventMutation, useMatchQuery, refetchStats };
export const { useNextRoundMutation, useClearRoundMutation } = eventApi;