import React from "react";

export default function LoadingStyle({ TagName, className, children }){
  return (
    <TagName className={"italic text-center font-thin "+className}>
      {children}
    </TagName>
  );
}