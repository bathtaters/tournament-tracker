import React, { useCallback, useState } from "react";

import InputBox from "./InputBox";
import { EditButton, LabelStyle, InputStyle, ButtonsStyle } from "../styles/PlayerDataStyles";

import { useUpdatePlayerMutation } from "../profile.fetch";
import { editClickController, saveController } from "../services/profile.services";
import { useHotkeys } from "../../common/services/basic.services";


function PlayerDataRow({ rowData, data, id }) {
  // Global state
  const [ updatePlayer ] = useUpdatePlayerMutation();
  
  // Local state
  const [isEditing, setEditing] = useState(false);
  const [editData, setEditData] = useState(data);
  
  // Actions
  const changeData = (e) => setEditData(e.target.value);
  const saveData = saveController(id, rowData.key, editData, data, updatePlayer);
  const setEdit = useCallback((edit = true) => { edit && setEditData(data); setEditing(edit); }, [data]);
  const handleClick = editClickController(isEditing, saveData, setEdit);

  useHotkeys({ 13/* ENTER */: handleClick}, { skip: !isEditing })

  // Render
  return (<>
      <LabelStyle>{rowData.title}</LabelStyle>

      <InputStyle>
        <InputBox 
          value={isEditing ? editData : data}
          isEditing={rowData.editable && isEditing}
          onChange={changeData}
          formatter={rowData.formatString}
        />
      </InputStyle>

      { rowData.editable ?
        <ButtonsStyle>
          <EditButton value={isEditing ? 'save' : 'edit'} onClick={handleClick} />

          { isEditing && <>
            <span>{' / '}</span>
            <EditButton value="cancel" onClick={()=>setEdit(false)} />
          </> }
        </ButtonsStyle>
        : 
        <div />
      }
  </>);
}

export default PlayerDataRow;