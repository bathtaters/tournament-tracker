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
export const HeaderStyle    = ({ children }) => <div className="stat text-right">{children}</div>
export const ValueStyle     = ({ children }) => <div class="stat-value">{children}</div>
export const DetailStyle    = ({ children }) => <div class="stat-desc">{children}</div>

export function ContainerStyle({ children }) {
  return (
    <div className="font-light self-start my-4 stats stats-vertical shadow-lg shadow-base-300">
      {children}
    </div>
  )
}