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

export const saveController = (id, key, value, data, updateData) => () => {
  if (!value.trim() || value.trim() === data) return;
  return updateData({ [key]: value, id });
}


// Cache update
export function playerUpdate({ id, ...body }, { dispatch }) {
  dispatch(fetchApi.util.updateQueryData('player', undefined, draft => { 
    Object.assign(draft[id], body); 
  }));
  dispatch(fetchApi.util.updateQueryData('player', id, draft => { 
    Object.assign(draft, body); 
  }));
};