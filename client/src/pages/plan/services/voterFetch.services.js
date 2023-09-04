import { fetchApi } from '../../common/common.fetch'

const newVoter = (id) => ({ id, dates: [], games: [], })

export function voterUpdate({ id, ...body }, { dispatch, queryFulfilled }) {
    const updateAll = dispatch(fetchApi.util.updateQueryData('voter', undefined, (draft) => { Object.assign(draft[id], body) }))

    const updateOne = dispatch(fetchApi.util.updateQueryData('voter', id, (draft) => ({ ...draft, ...body })))

    queryFulfilled.catch(() => { updateAll.undo(); updateOne.undo() }) // rollback
};


export function updateAll(voters, { dispatch, queryFulfilled }) {
    const updateAll = dispatch(fetchApi.util.updateQueryData('voter', undefined, (draft) => {
        Object.keys(draft).forEach((id) => { if (!voters.includes(id)) delete draft[id] })
        voters.forEach((id) => { if (!draft[id]) draft[id] = newVoter(id) })
    }))
    queryFulfilled.catch(() => { updateAll.undo() }) // rollback
};
