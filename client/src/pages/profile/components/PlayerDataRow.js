import React, { useCallback, useState } from "react";

import InputBox from "./InputBox";
import { EditButton, LabelStyle, InputGroupStyle } from "../styles/PlayerDataStyles";

import { useUpdatePlayerMutation } from "../profile.fetch";
import { editClickController, saveController } from "../services/profile.services";
import { useHotkeys } from "../../common/services/basic.services";
import { READ, WRITE } from "../profile.layout";


function PlayerDataRow({ rowData, data, id, access }) {
  if (data == null) data = '';

  // Global state
  const [ updatePlayer ] = useUpdatePlayerMutation();
  
  // Local state
  const [isEditing, setEditing] = useState(access === WRITE);
  const [editData, setEditData] = useState(data);
  
  // Actions
  const changeData = (e) => setEditData(e.target.value);
  const saveData = saveController(id, rowData, editData, data, updatePlayer);
  const setEdit = useCallback((edit = true) => { edit && setEditData(data); setEditing(edit); }, [data]);
  const handleClick = editClickController(isEditing, saveData, setEdit);

  useHotkeys({ Enter: handleClick }, { skip: !isEditing });

  if (!access) return;

  // Render
  return (
    <>
      <LabelStyle id={rowData.key}>{rowData.title}</LabelStyle>

      <InputGroupStyle>
        {access & READ ? <>
            <InputBox 
              id={rowData.key}
              value={isEditing ? editData : data ?? ''}
              isEditing={rowData.editable && isEditing}
              onChange={changeData}
              formatter={rowData.formatString}
              type={rowData.type}
            />

            { Boolean(access & WRITE) && rowData.editable && <>
              <EditButton value={isEditing ? 'save' : 'edit'} isEditing={isEditing} onClick={handleClick} />

              { isEditing && <EditButton value="undo" onClick={()=>setEdit(false)} /> }
            </> }
          </>

          :
          rowData.editable && <>
            <EditButton value="reset" isEditing={true} onClick={handleClick} />
          </>
        }
      </InputGroupStyle>

      <div />
    </>
  );
}

export default PlayerDataRow;