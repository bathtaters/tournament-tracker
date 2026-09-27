import type { ReactNode, ButtonHTMLAttributes } from "react";
import { PageTitleStyle } from "../../../common/General/styles/CommonStyles";
import { ElementStyle } from "../../../common/InputForm/InputFormStyles";
import { titleStyle } from "../../../common/EditableList/styles/EditableListStyles";

export const PlanWrapperStyle = ({ children }: { children?: ReactNode }) => (
  <div className="flex flex-col justify-center items-center gap-2">
    {children}
  </div>
);

export const PlanTitleStyle = ({
  title,
  left,
  right,
}: {
  title: ReactNode;
  left?: ReactNode;
  right?: ReactNode;
}) => (
  <div className="grid grid-cols-5 w-full">
    {left || <div />}
    <PageTitleStyle className="col-span-3">{title}</PageTitleStyle>
    {right || <div />}
  </div>
);

export const PlanMessageStyle = ({ children }: { children?: ReactNode }) => (
  <h3 className="font-thin text-center opacity-80">{children}</h3>
);

export const PlanErrorStyle = ({ children }: { children?: ReactNode }) => (
  <p className="font-bold text-center text-error/80">{children}</p>
);

export const PlanRowStyle = ({ children }: { children?: ReactNode }) => (
  <div className="w-full flex flex-col sm:flex-row justify-stretch gap-0 md:gap-4 my-2">
    {children}
  </div>
);

export const InputWrapperStyle = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <ElementStyle label={label} isFloating={false} labelClass={titleStyle}>
    {children}
  </ElementStyle>
);

export const PlanFooterStyle = ({ children }: { children?: ReactNode }) => (
  <div className="flex flex-row justify-center gap-4 w-full my-8">
    {children}
  </div>
);

export const PlanButton = (props: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    className={`btn btn-sm sm:btn-md grow text-xs sm:text-base ${props.className || "btn-primary"}`}
  />
);
