import React from "react";

export function WrapperStyle({ isTeam, children }) {
  return (<div>
    <h3 className="font-thin">{isTeam ? 'Team' : 'User'} Profile</h3>
    {children}
  </div>)
}

export function ProfileStyle({ children }) {
  return (<div className="flex flex-wrap">{children}</div>);
}

export function ProfilePicStyle({ children }) {
  return (<div className="w-36 h-40 alt-bgd m-2 flex">{children}</div>);
}

export function PlayerDataStyle({ children }) {
  return (
    <div className="grow shrink max-w-lg">
      <div className="grid grid-flow-row gap-x-2 gap-y-1 grid-cols-4 items-baseline w-full">
        {children}
      </div>
    </div>
  );
}