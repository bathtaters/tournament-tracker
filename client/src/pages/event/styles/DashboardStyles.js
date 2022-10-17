import React from "react";
import { PageTitleStyle as TitleStyle } from "../../common/styles/CommonStyles";

export { TitleStyle };

export function DashboardStyle({ children }) {
  return (
    <div className="flex flex-row flex-wrap justify-evenly gap-y-10">
      {children}
    </div>
  )
}

// Dashboard Styles
export const HeaderStyle    = ({ children }) => <div className="stat font-heading text-right">{children}</div>
export const ValueStyle     = ({ children }) => <div className="stat-value font-medium">{children}</div>
export const DetailStyle    = ({ children }) => <div className="stat-desc">{children}</div>

export const EventLinkStyle = ({ text, link }) => (
  <div className="text-center">
    <a className="link link-secondary link-hover" href={link} title={text} target="_blank">{text}</a>
  </div>
)

export function ContainerStyle({ children }) {
  return (
    <div className="font-light self-start my-4 mx-2 stats stats-vertical shadow-lg shadow-base-300">
      {children}
    </div>
  )
}