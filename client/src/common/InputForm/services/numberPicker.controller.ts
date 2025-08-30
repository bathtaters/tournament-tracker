import { InputPropsReturn } from "../InputForm.d";
import { type ChangeEventHandler, useMemo } from "react";
import { toNum } from "./inputForm.services";

// Prevent tooltip when value is outside of min/max limit
export const invalidHandler: ChangeEventHandler<HTMLInputElement> = (ev) =>
  ev.target.value.length && ev.preventDefault();

export function useNumberPicker<Data extends Record<string, any>>({
  id,
  min,
  max,
  handleChange,
}: InputPropsReturn<Data>) {
  return useMemo(
    () => ({
      decHandler: () =>
        handleChange((curr) => {
          let num = toNum(curr[id]) - 1;
          if (typeof min === "number" && num < min) num = min;
          else if (typeof max === "number" && num > max) num = max;
          return {
            ...curr,
            [id]: num,
          } as Data;
        }),
      // {
      // },

      incHandler: () =>
        handleChange((curr) => {
          let num = toNum(curr[id]) + 1;
          if (typeof min === "number" && num < min) num = min;
          else if (typeof max === "number" && num > max) num = max;
          return {
            ...curr,
            [id]: num,
          } as Data;
        }),
    }),
    [id, min, max, handleChange],
  );
}
