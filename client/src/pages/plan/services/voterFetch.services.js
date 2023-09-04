import { getCachedArgs } from '../../../core/services/global.services'
import { fetchApi } from '../../common/common.fetch'

const newVoter = (id) => ({ id, dates: [], games: [], })

export function voterUpdate({ id, ...body }, { dispatch, queryFulfilled }) {
    const updateAll = dispatch(fetchApi.util.updateQueryData('voter', undefined, (draft) => { Object.assign(draft[id], body) }))

    const updateOne = dispatch(fetchApi.util.updateQueryData('voter', id, (draft) => ({ ...draft, ...body })))

    queryFulfilled.catch(() => { updateAll.undo(); updateOne.undo() }) // rollback
};


export function updateVoters(voters, { dispatch, queryFulfilled, getState }) {
    const updateAll = dispatch(fetchApi.util.updateQueryData('voter', undefined, (draft) => {
        Object.keys(draft).forEach((id) => { if (!voters.includes(id)) delete draft[id] })
        voters.forEach((id) => { if (!draft[id]) draft[id] = newVoter(id) })
    }))

    const updateOne = getCachedArgs(getState(), 'voter').map((voter) => 
        dispatch(fetchApi.util.updateQueryData('voter', voter, (draft) => { if (!voters.includes(voter)) draft = null }))
    )

    queryFulfilled.catch(() => { updateAll.undo(); updateOne.forEach((update) => update.undo()) }) // rollback
};


export function updateEvents(events, { dispatch, queryFulfilled, getState }) {
    const updateAll = dispatch(fetchApi.util.updateQueryData('event', undefined, (draft) => {
        Object.keys(draft).forEach((id) => { draft[id].plan = events.includes(id) })
    }))

    const updateOne = getCachedArgs(getState(), 'event').map((event) => 
        dispatch(fetchApi.util.updateQueryData('event', event, (draft) => { draft.plan = events.includes(event) }))
    )

    queryFulfilled.catch(() => { updateAll.undo(); updateOne.forEach((update) => update.undo()) }) // rollback
};
