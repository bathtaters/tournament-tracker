import React from "react";
import { CopyRoundButton } from "./ButtonStyles";

export function RoundStyle({ title, isMissing, className='', handleCopy, children }) {
  return (
    <div className={'m-3 relative ' + className}>

      { handleCopy &&
        <span className="absolute top-0 right-0">
          <CopyRoundButton onClick={handleCopy} />
        </span>
      }

      <h3 className="font-normal text-center">{title}</h3>

      <div className="flex flex-col">{
        !isMissing ? children : (
          <div className="text-base-content text-center font-thin italic">Missing</div>
        )
      }</div>

    </div>
  );
}

export function EditRoundStyle({ children }) {
  return (<div className="font-thin text-sm italic text-center mt-1">{children}</div>);
}
