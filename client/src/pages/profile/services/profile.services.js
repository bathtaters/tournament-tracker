import { useCallback, useState } from "react";
import {
  useUpdatePlayerMutation,
  usePlayerState,
  useResetPasswordMutation,
} from "../profile.fetch";
import { hashText, useHotkeys } from "../../common/services/basic.services";
import { useOpenAlert } from "../../common/common.hooks";
import { WRITE } from "../profile.layout";
import { duplicateNameAlert, hasherAlert } from "../../../assets/alerts";

// Generate reset link from suffix
export const resetLink = (linkSuffix) =>
  `${window.location.href}/reset/${linkSuffix}`;

// Profile Controller
export default function usePlayerData(rowData, data, access, id) {
  if (data == null) data = "";

  // Global state
  const { data: allPlayers } = usePlayerState();
  const [updatePlayer] = useUpdatePlayerMutation();
  const [resetPassword] = useResetPasswordMutation();
  const openAlert = useOpenAlert();

  // Local state
  const [isEditing, setEditing] = useState(access === WRITE);
  const [editData, setEditData] = useState(data);

  // Form Control
  const changeData = (e) =>
    e.target.type === "checkbox"
      ? setEditData(e.target.checked)
      : setEditData(e.target.value);

  // Form Submit
  const saveData = async () => {
    const body = getUpdateBody(editData, data, rowData, id);
    if (!body) return;

    if ("reset" in body) return resetPassword(id);
    if (body.password) {
      body.password = await hashText(body.password);
      if (!body.password) return openAlert(hasherAlert);
    }
    if (playerIsUnique(body, allPlayers)) return updatePlayer(body);
    return openAlert(duplicateNameAlert(editData));
  };

  // Enable/Disable editing
  const setEdit = useCallback(
    (edit = true) => {
      edit && setEditData(data);
      setEditing(edit);
    },
    [data]
  );

  const handleClick = !isEditing
    ? () => setEdit(true)
    : () => saveData().then(() => setEdit(false));

  useHotkeys({ Enter: handleClick }, { skip: !isEditing });

  return { editData, isEditing, handleClick, changeData, setEdit };
}

// Controller Utilities

function getUpdateBody(editData, data, rowData, id) {
  const trimmed = typeof editData === "string" ? editData.trim() : editData;
  if (rowData.required && !trimmed) return;
  if (trimmed && trimmed === data) return;

  if (typeof editData === "string" && !trimmed) editData = null;
  return { [rowData.id]: editData, id };
}

function playerIsUnique({ id, name }, players) {
  if (!name || !players) return true;

  const newName = name.trim().toLowerCase();
  return Object.values(players).every(
    (p) => id === p.id || newName !== p.name.toLowerCase()
  );
}
