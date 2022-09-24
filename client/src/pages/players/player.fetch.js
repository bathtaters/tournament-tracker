import { fetchApi, getTags, usePlayerQuery, useSettingsQuery } from '../common/common.fetch';
import { playerUpdate, createUpdate, deleteUpdate } from './services/playerFetch.services';
import { debugLogging } from '../../assets/config';

export const playerApi = fetchApi.injectEndpoints({
  endpoints: (build) => ({
    
    updatePlayer: build.mutation({
      query: ({ id, ...body }) => ({ url: `player/${id}`, method: 'PATCH', body }),
      transformResponse: debugLogging ? res => console.log('UPD_PLAYER',res) || res : undefined,
      invalidatesTags: getTags('Player',{all:0}),
      onQueryStarted: playerUpdate,
    }),

    createPlayer: build.mutation({
      query: (body) => ({ url: `player`, method: 'POST', body, }),
      transformResponse: debugLogging ? res => console.log('ADD_PLAYER',res) || res : undefined,
      invalidatesTags: getTags('Player', { addAll:['Stats'] }),
      onQueryStarted: createUpdate,
    }),

    deletePlayer: build.mutation({
      query: id => ({ url: `player/${id}`, method: 'DELETE' }),
      transformResponse: debugLogging ? res => console.log('DEL_PLAYER',res) || res : undefined,
      invalidatesTags: getTags('Player', { addAll:['Stats'] }),
      onQueryStarted: deleteUpdate,
    }),
    
  }),
  overrideExisting: true
});

export { usePlayerQuery, useSettingsQuery };
export const { useCreatePlayerMutation, useDeletePlayerMutation } = playerApi;