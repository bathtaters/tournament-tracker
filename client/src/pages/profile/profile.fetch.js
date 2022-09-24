import { fetchApi, getTags, usePlayerQuery, useEventQuery, useSettingsQuery } from '../common/common.fetch';
import { playerUpdate } from './services/profile.services';
import { debugLogging } from '../../assets/config';


export const profileApi = fetchApi.injectEndpoints({
  endpoints: (build) => ({

    updatePlayer: build.mutation({
      query: ({ id, ...body }) => ({ url: `player/${id}`, method: 'PATCH', body }),
      transformResponse: debugLogging ? res => console.log('UPD_PLAYER',res) || res : undefined,
      invalidatesTags: getTags('Player',{all:0}),
      onQueryStarted: playerUpdate,
    }),
    
  }),
  overrideExisting: true
});

export { usePlayerQuery, useEventQuery, useSettingsQuery };
export const { useUpdatePlayerMutation } = profileApi;