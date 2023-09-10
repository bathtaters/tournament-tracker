import React from "react"

export const LoadingWrapper = ({ children }) => (
  <div className="flex flex-col justify-center items-center gap-4 m-4">
      <div className="loading loading-dots loading-sm sm:loading-lg" />
      <div className="font-light">{children}</div>
  </div>
)

export const LoadingStyle = ({ TagName, className, children }) => (
    <TagName className={"italic text-center font-thin "+className}>
      {children}
    </TagName>
)