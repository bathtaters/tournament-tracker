import React from "react";
import { PageTitleStyle } from "../../common/styles/CommonStyles";

export function WrapperStyle({ isTeam, children }) {
  return (<div>
    <PageTitleStyle className="mb-6">{isTeam ? 'Team' : 'User'} Profile</PageTitleStyle>
    {children}
  </div>)
}

export function ProfileStyle({ children }) {
  return (<div className="flex flex-wrap">{children}</div>);
}

export function ProfilePicStyle({ children }) {
  return (<div className="w-36 h-40 mask mask-squircle bg-base-300 p-4 pb-7 flex">{children}</div>);
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