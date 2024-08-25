import React from "react";
import { PageTitleStyle } from "../../common/styles/CommonStyles";

// MAIN STYLES \\

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

export const PicColumnStyle = ({ children }) => <div className="w-36">{children}</div>

export function ProfilePicStyle({ children }) {
  return <div className="w-full h-full mask mask-squircle bg-neutral flex">{children}</div>
}
export const defaultPicClass = "w-full h-full p-[15%] fill-neutral-content"

export function PlayerDataStyle({ children }) {
  return (
    <div className="grow shrink w-screen sm:max-w-md my-1">
      <form className="form-control grid grid-flow-row grid-cols-profile items-baseline px-4 gap-1">
        {children}
      </form>
    </div>
  )
}


// LINK STYLES \\

export const LinkWrapperStyle = ({ children }) => (
  <div className="w-full font-light text-sm text-center mt-4">{children}</div>
)

export const ResetLinkStyle = (props) => (
  <a className="link link-secondary" {...props}>Reset Password</a>
)

export const LoadingLinkStyle = () => <span className="opacity-60">...</span>
