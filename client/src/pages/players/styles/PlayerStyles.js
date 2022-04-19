import React from "react";
import { PageTitleStyle, ModalTitleStyle } from "../../common/styles/CommonStyles";

// Player
export const TitleStyle = ({ children }) => PageTitleStyle({ className: "mb-6", children });

export function StatsStyle({ children }) {
  return (<div className="px-6 flex justify-center mb-6">{children}</div>);
}

export function FooterStyle({ children }) {
  return (<h4 className="text-center">{children}</h4>);
}

// Add Player
export { ModalTitleStyle };

export const statsClass = {
  base: (canDelete) => 'border-2 rounded-md py-4 px-6 ' + (canDelete ? 'border-error' : 'border-transparent'),
  hover: (canDelete) => canDelete ? 'neg-bgd' : '',
};