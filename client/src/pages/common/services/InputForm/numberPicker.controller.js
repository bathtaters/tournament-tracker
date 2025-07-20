import { useMemo } from "react";

// Prevent tooltip when value is outside of min/max limit
export const invalidHandler = (ev) =>
  ev.target.value.length && ev.preventDefault();

// NumberPicker controller
const useNumberPicker = ({ min, max, onChange }) =>
  useMemo(
    () => ({
      decHandler: () =>
        onChange((value) => {
          if (value === min) return min;
          if (typeof min === "number" && value < min) return min;
          else if (typeof max === "number" && value > max) return max;
          return value - 1;
        }),

      incHandler: () =>
        onChange((value) => {
          if (value === max) return max;
          if (typeof max === "number" && value > max) return max;
          else if (typeof min === "number" && value < min) return min;
          return value + 1;
        }),
    }),
    [min, max, onChange]
  );

export default useNumberPicker;
