import React from "react";

import { InputStyle } from "../styles/PlayerDataStyles";
import { usePlayerQuery } from "../profile.fetch";

function InputBox({ value, setValueAs, ...props }) {
  const { data: playerData } = usePlayerQuery(undefined, {
    skip: typeof setValueAs !== "function",
  });
  const formatted =
    !props.disabled || !setValueAs ? value : setValueAs(value, playerData);

  // Edit box
  return <InputStyle {...props} value={formatted} />;
}

export default InputBox;
