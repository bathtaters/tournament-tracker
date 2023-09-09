import React from "react";

export function HeaderStyle({ children }) {
  return (<>
    <div className="fixed top-0 left-0 right-0 z-50 bg-base-200 bg-opacity-90">
      <div className="navbar h-24 sm:h-36 max-w-4xl m-auto">
        {children}
      </div>
    </div>
    <div className="h-24 sm:h-36" />
  </>)
}

export function TitleStyle({ children }) {
  return (
    <div className="navbar-center flex-auto h-full">
      <h3 className="text-primary dark:text-primary-content font-medium m-auto px-2 text-center line-clamp-2 leading-none text-ellipsis overflow-hidden h-full">
        {children}
      </h3>
    </div>
  );
}

export const reloadingClass = "animate-spin ease-linear"