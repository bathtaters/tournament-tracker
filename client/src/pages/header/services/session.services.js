import { fetchApi } from '../../common/common.fetch';
import { setLocalVar } from '../../common/services/fetch.services';
import { localKeys } from '../../../assets/constants';
import { debugLogging } from '../../../assets/config';


export function saveSession(playerData) {
    setLocalVar(localKeys.session, playerData?.session || null);
    if (debugLogging) console.log('LOGIN_PLAYER',playerData);
}

export function sessionLogin({ name }, { dispatch, queryFulfilled }) {
    const update = dispatch(fetchApi.util.updateQueryData('session', undefined, () => ({ name })));
    queryFulfilled.catch(() => { update.undo(); }); // rollback
}

export function sessionLogout(_, { dispatch, queryFulfilled }) {
    setLocalVar(localKeys.session, null);
    const update = dispatch(fetchApi.util.updateQueryData('session', undefined, () => ({})));
    queryFulfilled.catch(() => { update.undo(); }); // rollback
}
