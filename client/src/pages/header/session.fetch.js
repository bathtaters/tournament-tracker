import { fetchApi } from '../common/common.fetch';
import { sessionLogin, sessionLogout } from './services/session.services';
import { debugLogging } from '../../assets/config';

export const sessionApi = fetchApi.injectEndpoints({
  endpoints: (build) => ({
    
    login: build.mutation({
        query: ({ name, password }) => ({ url: `/session`, method: 'POST', body: { name, password } }),
        transformResponse: debugLogging ? (res) => console.log('LOGIN_PLAYER',res) || res : undefined,
        invalidatesTags: ['Session'],
        onQueryStarted: sessionLogin,
    }),

    logout: build.mutation({
        query: () => ({ url: `/session`, method: 'DELETE' }),
        transformResponse: debugLogging ? (res) => console.log('LOGOUT_PLAYER',res) || res : undefined,
        invalidatesTags: ['Session'],
        onQueryStarted: sessionLogout,
    }),
    
  }),
  overrideExisting: true
});

export const { useLoginMutation, useLogoutMutation } = sessionApi;