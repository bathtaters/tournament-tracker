import React from "react";

export function RoundStyle({ title, isMissing, className='', children }) {
  return (
    <div className={'m-4 relative ' + className}>

      <h3 className="font-light text-center">{title}</h3>

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
