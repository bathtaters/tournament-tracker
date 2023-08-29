import React from "react";
import { PageTitleStyle } from "../../common/styles/CommonStyles";

export function WrapperStyle({ isTeam, children }) {
  return (
    <div>
      <PageTitleStyle className="mb-3 sm:mb-6">{isTeam ? 'Team' : 'User'} Profile</PageTitleStyle>
      {children}
    </div>
  )
}

export function ProfileStyle({ children }) {
  return <div className="flex flex-col sm:flex-row justify-center items-center sm:items-start">{children}</div>
}

export function ProfilePicStyle({ children }) {
  return <div className="w-36 h-40 mask mask-squircle bg-neutral flex">{children}</div>
}
export const defaultPicClass = "w-full h-full p-[15%] fill-neutral-content"

export function PlayerDataStyle({ children }) {
  return (
    <div className="grow shrink w-screen sm:max-w-md my-1">
      <div className="form-control grid grid-flow-row grid-cols-profile items-baseline px-4 gap-1">
        {children}
      </div>
    </div>
  )
}