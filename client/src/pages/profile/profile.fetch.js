import { fetchApi, getTags, usePlayerQuery, useEventQuery, useSettingsQuery, commonApi } from '../common/common.fetch';
import { playerUpdate, resetUpdate } from './services/profileFetch.services';
import { debugLogging } from '../../assets/config';


export const profileApi = fetchApi.injectEndpoints({
  endpoints: (build) => ({

    resetSession: build.query({
      query: ({ id, session }) => ({ url: `/session/${id}`, method: 'POST', body: { session } }),
      transformResponse: debugLogging ? (res) => console.log('CAN_RESET',res) || res : undefined,
      providesTags: ['ResetPass'],
    }),

    updatePlayer: build.mutation({
      query: ({ id, ...body }) => ({ url: `player/${id}`, method: 'PATCH', body }),
      transformResponse: debugLogging ? (res) => console.log('UPD_PLAYER',res) || res : undefined,
      invalidatesTags: getTags('Player',{ all: 0, addBase: ['ResetPass'] }),
      onQueryStarted: playerUpdate,
    }),

    resetPassword: build.mutation({
      query: (id) => ({ url: `player/${id}/reset`, method: 'POST' }),
      transformResponse: debugLogging ? (res) => console.log('RESET_PW',res) || res : undefined,
      onQueryStarted: resetUpdate,
      invalidatesTags: ['ResetPass'],
    }),
    
  }),
  overrideExisting: true
});

export const usePlayerState = commonApi.endpoints.player.useQueryState;
export { usePlayerQuery, useEventQuery, useSettingsQuery };
export const { useResetSessionQuery, useUpdatePlayerMutation, useResetPasswordMutation } = profileApi;