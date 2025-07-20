import React from "react";
import InputBox from "./InputBox";
import {
  EditButton,
  LabelStyle,
  InputGroupStyle,
} from "../styles/PlayerDataStyles";
import usePlayerData from "../services/profile.services";
import { READ, WRITE } from "../profile.layout";

function PlayerDataRow({ rowData, data, id, access }) {
  const { editData, isEditing, handleClick, changeData, setEdit } =
    usePlayerData(rowData, data, access, id);

  if (!access) return;

  // Render
  return (
    <>
      <LabelStyle id={rowData.id}>{rowData.label || rowData.id}</LabelStyle>

      <InputGroupStyle>
        {access & READ ? (
          <>
            <InputBox
              value={isEditing ? editData : (data ?? "")}
              disabled={!isEditing}
              onChange={changeData}
              {...rowData}
            />

            {Boolean(access & WRITE) && !rowData.disabled && (
              <>
                <EditButton
                  value={isEditing ? "save" : "edit"}
                  isEditing={isEditing}
                  onClick={handleClick}
                />

                {isEditing && (
                  <EditButton value="undo" onClick={() => setEdit(false)} />
                )}
              </>
            )}
          </>
        ) : (
          <EditButton
            value="reset"
            isEditing={true}
            onClick={handleClick}
            disabled={rowData.disabled}
          />
        )}
      </InputGroupStyle>

      <div />
    </>
  );
}

export default PlayerDataRow;
