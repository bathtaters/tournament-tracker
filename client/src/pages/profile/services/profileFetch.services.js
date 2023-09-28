import { fetchApi } from '../../common/common.fetch';
import { idToUrl } from '../../common/services/idUrl.services';

export const LOADING = 'LOADING'

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
  
export async function resetUpdate(id, { dispatch, queryFulfilled }) {

    // Set reset link to 'loading'
    const updateAll = dispatch(fetchApi.util.updateQueryData(
        'player', undefined,
        (draft) => { Object.assign(draft[id], { resetlink: LOADING }) }
    ))

    const updateOne = dispatch(fetchApi.util.updateQueryData(
        'player', id, 
        (draft) => { Object.assign(draft, { resetlink: LOADING }) }
    ))
    

    // Set reset link to result
    try {
        const { data } = await queryFulfilled
        const resetlink = data.session ? idToUrl(data.session) : null

        dispatch(fetchApi.util.updateQueryData(
            'player', undefined,
            (draft) => { Object.assign(draft[id], { resetlink }) }
        ))
    
        dispatch(fetchApi.util.updateQueryData(
            'player', id, 
            (draft) => { Object.assign(draft, { resetlink }) }
        ))

    // Rollback on error
    } catch {
        updateAll.undo()
        updateOne.undo()
    }
}
