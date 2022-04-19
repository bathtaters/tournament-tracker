import React from "react";

import { InputStyle } from "../styles/PlayerDataStyles";
import { usePlayerQuery } from "../profile.fetch";

function InputBox({ id, value, isEditing, onChange, formatter }) {
  const { data: playerData } = usePlayerQuery(null, { skip: !formatter });

  const formatted = isEditing || !formatter ? value : formatter(value, playerData)

  // Edit box
  return (<InputStyle id={id} disabled={!isEditing} onChange={onChange} value={formatted} />);
}

export default InputBox;