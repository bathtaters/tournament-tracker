import React from "react";

export function TitleStyle({ children }) {
  return <h2 className="text-center font-thin">{children}</h2>
}

export function DashboardStyle({ children }) {
  return (
    <div className="flex flex-row flex-wrap justify-evenly">
      {children}
    </div>
  )
}

// Dashboard Styles
export const ContainerStyle = ({ children }) => (<div className="text-center font-light">{children}</div>);
export const StatusStyle = ({ children }) => (<h4 className="font-thin max-color">{children}</h4>);
export const DetailStyle = ({ children }) => (<h5 className="pt-0 italic dim-color">{children}</h5>);

export const textStyle = {
  base: "mr-2",
  dynamic: "sm:text-2xl",
  both: () => textStyle.base + ' ' +textStyle.dynamic
};