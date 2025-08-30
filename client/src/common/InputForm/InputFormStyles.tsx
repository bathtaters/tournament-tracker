import type { FormEventHandler, MouseEventHandler, ReactNode } from "react";
import type { FormInput, InputPropsReturn } from "./InputForm.d";
import LockIcon from "common/icons/LockIcon";

// Input Element
export const elementDefaults = {
  className: "font-light mx-1 sm:mx-4",
  labelClass: "block mb-1",
  inputWrapperClass: "",
  inputClass: "",
  buttonClass: "btn-primary mx-1 sm:mx-4",
};
export const typeDefaults: Partial<
  Record<FormInput<any>["type"] & string, string>
> = {
  text: "input bg-base-200 invalid:input-warning",
  url: "input bg-base-200 invalid:input-warning",
  date: "input bg-base-200 invalid:input-warning",
  checkbox: "toggle",
  time: "input bg-base-200 min-w-12 pl-2 py-1 invalid:input-warning",
  number:
    "input bg-base-200 invalid:input-warning p-1 text-center hide-arrows w-12 sm:w-16 h-8 sm:h-12",
};

// Form wrapper
export function FormContainer({
  onSubmit,
  children,
}: {
  onSubmit?: FormEventHandler<HTMLFormElement>;
  children?: ReactNode;
}) {
  return <form onSubmit={onSubmit}>{children}</form>;
}

// Row/Column wrapper
export function RowStyle({
  isRow,
  children,
}: {
  isRow?: boolean;
  children?: ReactNode;
}) {
  return (
    <div
      className={`flex justify-start items-start ${isRow ? "flex-col sm:flex-row" : "flex-col"} w-full py-1`}
    >
      {children}
    </div>
  );
}

export function GroupWrapper({
  isFragment = false,
  isRow = false,
  children,
}: {
  isFragment?: boolean;
  isRow?: boolean;
  children?: ReactNode;
}) {
  if (isFragment) return <>{children}</>;
  return <RowStyle isRow={isRow}>{children}</RowStyle>;
}

export function Spacer({ className }: { className?: string }) {
  return <div className={className} />;
}

type ElementStyleProps = {
  label?: string;
  isFragment?: boolean;
  isFloating?: boolean;
  inputProps?: InputPropsReturn<Record<"string", any>>;
  className?: string;
  labelClass?: string;
  children?: ReactNode;
};

// Input Element wrapper
export function ElementStyle({
  label,
  isFragment,
  isFloating = true,
  inputProps = {},
  className,
  labelClass,
  children,
}: ElementStyleProps) {
  if (isFragment)
    return (
      <>
        <label
          className={`label ${labelClass ?? elementDefaults.labelClass}`}
          htmlFor={inputProps.id}
        >
          {label}
        </label>
        {children}
      </>
    );

  return (
    <span
      className={`${className ?? elementDefaults.className} w-full flex flex-row p-2`}
    >
      {inputProps.type === "checkbox" ? (
        <label
          className={`flex gap-2 text-sm text-left w-full ${inputProps.disabled ? "join" : ""}`}
          htmlFor={inputProps.id}
        >
          {children}
          <span className={`label ${labelClass ?? elementDefaults.labelClass}`}>
            {label}
          </span>
        </label>
      ) : (
        <label
          className={`${isFloating ? "floating-label" : ""} w-full ${inputProps.disabled ? "join" : ""}`}
          htmlFor={inputProps.id}
        >
          <span
            className={`label ${labelClass ?? (isFloating ? "" : elementDefaults.labelClass)}`}
          >
            {label}
          </span>
          {children}
        </label>
      )}
    </span>
  );
}

// Apply Disabled Lock to Input Elements
export const LockStyle = () => (
  <div className="flex text-secondary bg-base-200 pr-1 sm:pr-2 join-item">
    <LockIcon />
  </div>
);

// Input Form Buttons
export function ButtonContainer({ children }: { children?: ReactNode }) {
  return (
    <div className="mt-4 w-full flex justify-center items-baseline flex-wrap">
      {children}
    </div>
  );
}

type ButtonProps = {
  label?: string;
  onClick?: MouseEventHandler<HTMLInputElement>;
  className?: string;
  isSubmit?: boolean;
};

export function ButtonElement({
  label,
  onClick = undefined,
  className = elementDefaults.buttonClass,
  isSubmit = false,
}: ButtonProps) {
  return (
    <input
      className={"btn " + className}
      value={label}
      type={isSubmit ? "submit" : "button"}
      onClick={onClick}
      key={label}
    />
  );
}
