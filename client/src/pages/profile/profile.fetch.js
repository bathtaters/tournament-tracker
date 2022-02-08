import {
  fetchApi, getTags, usePrefetch,
  usePlayerQuery, useEventQuery, useSettingsQuery
} from '../common/common.fetch';
import { playerUpdate } from './services/profile.services';


export const profileApi = fetchApi.injectEndpoints({
  endpoints: (build) => ({
    
    playerEvents:  build.query({
      query: (id) => `player/${id}/events`,
      transformResponse: res => console.log('PLAYER_EVENTS',res) || res,
      providesTags: getTags('PlayerDetail',{ all: false }),
    }),

    updatePlayer: build.mutation({
      query: ({ id, ...body }) => ({ url: `player/${id}`, method: 'PATCH', body }),
      transformResponse: res => console.log('UPD_PLAYER',res) || res,
      invalidatesTags: getTags('Player',{all:0}),
      onQueryStarted: playerUpdate,
    }),
    
  }),
  overrideExisting: true
});

export { usePlayerQuery, useEventQuery, useSettingsQuery, usePrefetch };
export const { usePlayerEventsQuery, useUpdatePlayerMutation } = profileApi;