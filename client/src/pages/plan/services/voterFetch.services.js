import { fetchApi } from '../../common/common.fetch'

const newVoter = (id) => ({ id, dates: [], games: [], })

export function voterUpdate({ id, ...body }, { dispatch, queryFulfilled }) {
    const updateAll = dispatch(fetchApi.util.updateQueryData('voter', undefined, (draft) => { Object.assign(draft[id], body) }))

    const updateOne = dispatch(fetchApi.util.updateQueryData('voter', id, (draft) => ({ ...draft, ...body })))

    queryFulfilled.catch(() => { updateAll.undo(); updateOne.undo() }) // rollback
};


export function addUpdate(id, { dispatch, queryFulfilled }) {
    const updatePlayer = dispatch(fetchApi.util.updateQueryData('voter', undefined, (draft) => { draft[id] = newVoter(id) }))
    queryFulfilled.catch(() => { updatePlayer.undo() }) // rollback
};


export function removeUpdate(id, { dispatch, queryFulfilled }) {
    const updatePlayer = dispatch(fetchApi.util.updateQueryData('voter', undefined, (draft) => { delete draft[id] }));
    queryFulfilled.catch(() => { updatePlayer.undo() }) // rollback
};