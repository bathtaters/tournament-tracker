import React from "react";

// Player
export function TitleStyle({ children }) {
  return (<h2 className="font-thin text-center mb-6">{children}</h2>);
}

export function StatsStyle({ children }) {
  return (<div className="px-6 flex justify-center mb-6">{children}</div>);
}

export function FooterStyle({ children }) {
  return (<h4 className="text-center">{children}</h4>);
}

// Add Player
export function ModalTitleStyle({ children }) {
  return (<h3 className="font-light max-color text-center mb-4">{children}</h3>);
}

export const statsClass = {
  base: (canDelete) => 'neg-border border-2 rounded-md' + (canDelete ? '' : ' border-opacity-0'),
  hover: (canDelete) => canDelete ? 'neg-bgd' : '',
};