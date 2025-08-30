import type { ReactNode } from "react";
import type { ListClassNames } from "./services/suggestText";
import SuggestList, { type SuggestListProps } from "./components/SuggestList";
import SuggestTextBox, {
  type SuggestBoxProps,
} from "./components/SuggestTextBox";
import { HiddenList, WrapperStyle } from "./components/SuggestTextStyles";
import { listClassDef } from "./services/suggestText.custom";
import useSuggestText from "./services/suggestText.controller";

export { useSuggestText };

type SuggestTextProps = {
  /** Pass from useSuggestText */
  backend: {
    boxProps: Partial<SuggestBoxProps>;
    listProps: Partial<SuggestListProps> &
      Omit<SuggestListProps, "label" | "classes">;
    showList?: boolean;
    isHidden?: boolean;
  };
  className: string;
  listClasses: ListClassNames;
  label: string;
  placeholder: string;
  children: ReactNode;
};

export function SuggestText({
  backend,
  className,
  listClasses = listClassDef,
  label = "suggest-text",
  placeholder,
  children,
}: SuggestTextProps) {
  const { boxProps, listProps, showList, isHidden } = backend;

  return (
    <WrapperStyle className={listClasses.main ?? ""}>
      <SuggestTextBox
        className={className ?? listClasses.textbox ?? listClassDef.textbox}
        isHidden={isHidden}
        placeholder={placeholder}
        label={label}
        {...boxProps}
      />

      {showList ? (
        <SuggestList classes={listClasses} label={label} {...listProps} />
      ) : (
        <HiddenList label={label} />
      )}

      {children}
    </WrapperStyle>
  );
}
