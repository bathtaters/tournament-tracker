import { fetchApi } from '../../common/common.fetch';
import { idToUrl } from '../../common/services/idUrl.services';

export function playerUpdate({ id, ...body }, { dispatch, queryFulfilled }) {

    const updateAll = dispatch(fetchApi.util.updateQueryData(
        'player', undefined,
        (draft) => { Object.assign(draft[id], body) }
    ))

    const updateOne = dispatch(fetchApi.util.updateQueryData(
        'player', id,
        (draft) => { Object.assign(draft, body) }
    ))

    queryFulfilled.catch(() => { updateAll.undo(); updateOne.undo() }) // rollback
}
