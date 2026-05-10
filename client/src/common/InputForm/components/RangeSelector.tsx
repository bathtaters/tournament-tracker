import type { FormElementProps } from "../InputForm.d";

export default function RangeSelector<Data extends Record<string, any>>({
  wrapperClass,
  className,
  inputProps,
}: FormElementProps<Data>) {
  return (
    <div className={`flex ${wrapperClass ?? "w-full flex-row"}`}>
      <input
        type="range"
        className={`range grow ${className ?? "range-primary"} disabled:cursor-not-allowed`}
        {...inputProps}
      />
      <div className="shrink border border-primary ml-2 w-8 flex justify-center items-center">
        {inputProps.value || "-"}
      </div>
    </div>
  );
}
