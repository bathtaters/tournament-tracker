import type { ReactNode, RefObject } from "react";
import { useLayoutListener } from "../services/suggestText.utils";
import { layoutClasses, listClassDef } from "../services/suggestText.custom";
import { ListClassNames } from "../services/suggestText";

export function WrapperStyle({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <span className={`${layoutClasses.containerWrapper} ${className}`}>
      {children}
    </span>
  );
}

export function EntryStyle({
  classes,
  isSelected,
  children,
  id,
}: {
  classes?: ListClassNames;
  isSelected?: boolean;
  children?: ReactNode;
  id: string;
}) {
  return (
    <li
      id={id}
      className={`${classes?.base ?? listClassDef.base} ${
        isSelected
          ? (classes?.select ?? listClassDef.select)
          : (classes?.unselect ?? listClassDef.unselect)
      }`}
    >
      {children}
    </li>
  );
}

export const HiddenList = ({ label }: { label: string }) => (
  <span className="hidden" aria-hidden="true" id={label + "-list"} />
);

type ListStyleProps = {
  divRef: RefObject<HTMLDivElement>;
  textbox: RefObject<HTMLInputElement>;
  children?: ReactNode;
  label: string;
  className?: string;
};

export function ListStyle({
  divRef,
  textbox,
  children,
  label,
  className = listClassDef.wrapper,
}: ListStyleProps) {
  // List width
  useLayoutListener(
    ["resize"],
    () => {
      divRef.current.style.width = !textbox.current
        ? "inherit"
        : `${textbox.current.offsetWidth - layoutClasses.listSideInset * 2}px`;

      divRef.current.style.marginLeft = `${layoutClasses.listSideInset}px`;
    },
    [textbox.current?.offsetWidth],
  );

  // List height
  useLayoutListener(
    ["resize", "scroll"],
    () => {
      if (divRef.current)
        divRef.current.style.maxHeight =
          layoutClasses.overrideMaxHeight ||
          `${
            divRef.current.getBoundingClientRect().bottom -
            layoutClasses.listTopMargin
          }px`;
    },
    [
      layoutClasses.overrideMaxHeight ||
        divRef.current?.getBoundingClientRect()?.bottom,
    ],
  );

  return (
    <div className={`${layoutClasses.listWrapper} ${className}`} ref={divRef}>
      <ul id={label + "-list"}>{children}</ul>
    </div>
  );
}
