import {
  fetchApi, getTags, usePrefetch,
  usePlayerQuery, useEventQuery, useSettingsQuery
} from '../common/common.fetch';


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
      onQueryStarted({ id, ...body }, { dispatch }) {
        dispatch(fetchApi.util.updateQueryData('player', undefined, draft => { 
          Object.assign(draft[id], body); 
        }));
        dispatch(fetchApi.util.updateQueryData('player', id, draft => { 
          Object.assign(draft, body); 
        }));
      },
    }),
    
  }),
  overrideExisting: true
});

export { usePlayerQuery, useEventQuery, useSettingsQuery, usePrefetch };
export const { usePlayerEventsQuery, useUpdatePlayerMutation } = profileApi;