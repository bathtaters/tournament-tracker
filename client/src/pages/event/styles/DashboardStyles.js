import React from "react";
import { PageTitleStyle as TitleStyle } from "../../common/styles/CommonStyles";

export { TitleStyle };

export function DashboardStyle({ children }) {
  return (
    <div className="flex flex-row flex-wrap justify-evenly">
      {children}
    </div>
  )
}

// Dashboard Styles
export const ContainerStyle = ({ children }) => (<div className="text-center font-light">{children}</div>);
export const StatusStyle = ({ children }) => (<h4 className="font-thin text-secondary">{children}</h4>);
export const DetailStyle = ({ children }) => (<h5 className="pt-0 italic text-base-content">{children}</h5>);

export const textStyle = {
  base: "mr-2",
  dynamic: "sm:text-2xl",
  both: () => textStyle.base + ' ' +textStyle.dynamic
};