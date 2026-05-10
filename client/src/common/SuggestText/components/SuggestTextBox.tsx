import type { ChangeEventHandler, FocusEvent, RefObject } from "react";

export type SuggestBoxProps = {
  inputRef?: RefObject<HTMLInputElement>;
  label: string;
  selected?: string;
  value?: string;
  placeholder?: string;
  className?: string;
  isHidden?: boolean;
  handleFocus?: (
    isFocused: boolean,
    event: FocusEvent<HTMLInputElement>,
  ) => void;
  change?: ChangeEventHandler<HTMLInputElement>;
  showList?: boolean;
};

export default function SuggestTextBox({
  inputRef,
  label,
  selected,
  value,
  placeholder,
  className,
  isHidden,
  handleFocus,
  change,
  showList,
}: SuggestBoxProps) {
  return (
    <input
      type="text"
      id={label + "-textbox"}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="on"
      role="combobox"
      aria-autocomplete="list"
      aria-haspopup="listbox"
      aria-controls={label + "-list"}
      aria-owns={label + "-list"}
      aria-expanded={showList}
      aria-activedescendant={selected}
      aria-label={label || "Text box"}
      placeholder={placeholder ?? ""}
      value={value}
      className={`${className} ${isHidden ? "hidden" : ""}`}
      onBlur={(ev) => handleFocus(false, ev)}
      onFocus={(ev) => handleFocus(true, ev)}
      onChange={change}
      ref={inputRef}
    />
  );
}
