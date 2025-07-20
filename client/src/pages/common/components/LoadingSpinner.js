import React from "react";

// Percent amount the ring is full
const percentFilled = "35";

// Create rotating ring effect
function LoadingStyle({ size = "2rem", className = "" }) {
  return (
    <div
      className={"animate-spin ease-linear radial-progress " + className}
      style={{ "--value": percentFilled, "--size": size }}
    />
  );
}

export default LoadingStyle;
