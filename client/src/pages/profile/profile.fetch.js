import { fetchApi, getTags, commonApi } from '../common/common.fetch';
import { playerUpdate, resetUpdate } from './services/profileFetch.services';
import { debugLogging } from '../../assets/config';


export const profileApi = fetchApi.injectEndpoints({
  endpoints: (build) => ({

    resetSession: build.query({
      query: ({ id, session }) => ({ url: `/session/${id || 'setup'}`, method: 'POST', body: { session } }),
      transformResponse: debugLogging ? (res) => console.log('CAN_SETUP',res) || res : undefined,
      providesTags: ['Setup'],
    }),

    updatePlayer: build.mutation({
      query: ({ id, ...body }) => ({ url: `player/${id}`, method: 'PATCH', body }),
      transformResponse: debugLogging ? (res) => console.log('UPD_PLAYER',res) || res : undefined,
      invalidatesTags: getTags('Player',{ all: 0, addBase: ['Setup'] }),
      onQueryStarted: playerUpdate,
    }),

    resetPassword: build.mutation({
      query: (id) => ({ url: `player/${id}/reset`, method: 'POST' }),
      transformResponse: debugLogging ? (res) => console.log('RESET_PW',res) || res : undefined,
      onQueryStarted: resetUpdate,
      invalidatesTags: ['Setup'],
    }),
    
  }),
  overrideExisting: true
});

export const usePlayerState = commonApi.endpoints.player.useQueryState;
export { useCreatePlayerMutation } from "../players/player.fetch"
export { usePlayerQuery, useEventQuery, useSettingsQuery } from '../common/common.fetch';
export const { useResetSessionQuery, useUpdatePlayerMutation, useResetPasswordMutation } = profileApi;