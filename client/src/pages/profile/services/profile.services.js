import { useCallback, useState } from "react";
import { useUpdatePlayerMutation, usePlayerState } from "../profile.fetch";
import { useHotkeys } from "../../common/services/basic.services";
import { useOpenAlert } from "../../common/common.hooks";
import { WRITE } from "../profile.layout";
import { duplicateNameAlert } from "../../../assets/alerts";


// Profile Controller
export default function usePlayerData(rowData, data, access, id) {
  if (data == null) data = '';

  // Global state
  const { data: allPlayers } = usePlayerState();
  const [ updatePlayer ] = useUpdatePlayerMutation();
  const openAlert = useOpenAlert();
  
  // Local state
  const [isEditing, setEditing] = useState(access === WRITE);
  const [editData, setEditData] = useState(data);
  
  // Form Control
  const changeData = (e) => setEditData(e.target.value);

  // Form Submit
  const saveData = () => {  
    const body = getUpdateBody(editData, data, rowData, id);
    if (!body) return;

    if (playerIsUnique(body, allPlayers)) return updatePlayer(body);
    return openAlert(duplicateNameAlert(editData));
  };

  // Enable/Disable editing
  const setEdit = useCallback((edit = true) => {
    edit && setEditData(data);
    setEditing(edit);
  }, [data]);

  const handleClick = !isEditing ?
    () => setEdit(true) :
    () => { saveData(); setEdit(false); };

  useHotkeys({ Enter: handleClick }, { skip: !isEditing });


  return { editData, isEditing, handleClick, changeData, setEdit };
}





// Controller Utilities

function getUpdateBody(editData, data, rowData, id) {
  if (rowData.required && (!editData || !editData.trim())) return;
  if (editData && editData.trim() === data) return;
  
  return { [rowData.id]: editData || null, id };
}


function playerIsUnique({ id, name }, players) {
  if (!name || !players) return true;

  const newName = name.trim().toLowerCase();
  return Object.values(players).every(
    (p) => id === p.id || newName !== p.name.toLowerCase()
  );
}