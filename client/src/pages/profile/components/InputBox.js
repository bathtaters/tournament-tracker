import React from "react";

import { usePlayerQuery } from "../profile.fetch";

function InputBox({ value, isEditing, onChange, formatter }) {
  const { data: playerData } = usePlayerQuery(null, { skip: !formatter });

  // Edit box
  if (isEditing) return (<input onChange={onChange} type="text" value={value} />);

  // Stored value
  return (<div>{formatter ? formatter(value, playerData) : value}</div>);
}

export default InputBox;