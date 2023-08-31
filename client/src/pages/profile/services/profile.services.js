import { fetchApi } from '../../common/common.fetch';

// Profile controllers
export function editClickController(isEditing, saveData, setEdit) {
  // Begin edit
  if (!isEditing) return () => setEdit(true);
  // Save edit
  return () => {
    saveData();
    setEdit(false);
  }
}

export const saveController = (id, { key, required }, value, data, updateData) => () => {
  if (required && (!value || !value.trim())) return;
  if (value && value.trim() === data) return;
  return updateData({ [key]: value || null, id });
}


// Cache update
export function playerUpdate({ id, ...body }, { dispatch, queryFulfilled }) {
  const updateAll = dispatch(fetchApi.util.updateQueryData('player', undefined, draft => { 
    Object.assign(draft[id], body); 
  }));
  const updateOne = dispatch(fetchApi.util.updateQueryData('player', id, draft => { 
    Object.assign(draft, body); 
  }));
  queryFulfilled.catch(() => { updateAll.undo(); updateOne.undo(); }); // rollback
};