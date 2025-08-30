import React from "react";
import { onClickAll } from "../General/services/basic.services";

function OverlayContainer({
  children = undefined,
  onClick = undefined,
  className = "",
  z = "z-50",
}) {
  return (
    <div className={`fixed top-0 left-0 ${z} w-screen h-screen ${className}`}>
      <div
        className="absolute w-full h-full bg-base-300/60"
        {...onClickAll(onClick)}
      />
      {children}
    </div>
  );
}

export default OverlayContainer;
