import { ReactNode } from "react";
import {
  PageTitleStyle,
  ModalTitleStyle,
} from "../../../common/General/styles/CommonStyles";

// Player
export const TitleStyle = ({ children }: { children: ReactNode }) => {
  return <PageTitleStyle className="mb-6">{children}</PageTitleStyle>;
};

export function StatsStyle({ children }: { children: ReactNode }) {
  return <div className="px-6 flex justify-center mb-6">{children}</div>;
}

export function FooterStyle({ children }: { children: ReactNode }) {
  return <h4 className="join w-full justify-center">{children}</h4>;
}

// Add Player
export { ModalTitleStyle };

export const statsClass = {
  base: (canDelete = false) =>
    "border-2 rounded-md py-4 px-6 " +
    (canDelete ? "border-error" : "border-transparent"),

  hover: (canDelete = false) =>
    canDelete ? "hover:bg-error" : "hover:bg-base-200",
};
