import React from "react";

import { InputStyle, SelectOptionStyle } from "../styles/PlayerDataStyles";
import { usePlayerQuery } from "../profile.fetch";

function InputBox({ id, value, isEditing, onChange, type, formatter }) {
  const { data: playerData } = usePlayerQuery(null, { skip: typeof formatter !== 'function' });

  if (Array.isArray(formatter)) {
    return (
      <SelectOptionStyle id={id} disabled={!isEditing} onChange={onChange} value={value} options={formatter} />
    )
  }

  const formatted = isEditing || !formatter ? value : formatter(value, playerData);

  // Edit box
  return (<InputStyle id={id} type={type} disabled={!isEditing} onChange={onChange} value={formatted} />);
}

export default InputBox;