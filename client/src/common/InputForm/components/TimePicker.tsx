import type {
  FormElementProps,
  InputAttributes,
  TimePlace,
} from "../InputForm.d";
import {
  eventWithValue,
  useParentFocus,
} from "../../General/services/basic.services";

type TimePickerProps<T> = Omit<FormElementProps<T>, "inputProps"> & {
  inputProps: InputAttributes<T> & Record<TimePlace, InputAttributes<T>>;
};

export default function TimePicker<Data extends Record<string, any>>({
  inputProps: { onBlur, hours, minutes, seconds },
  wrapperClass,
  className,
}: TimePickerProps<Data>) {
  const value = {
    hours: padded(hours),
    minutes: padded(minutes),
    seconds: padded(seconds),
  };

  const listeners = useParentFocus(
    null,
    onBlur && ((ev) => onBlur(eventWithValue(ev, value))),
  );

  return (
    <div className={`join ${wrapperClass}`} {...listeners}>
      <input
        {...hours}
        min={hours.min ?? 0}
        max={hours.max ?? 99}
        pattern="^\d*$"
        className={className}
        value={value.hours}
      />
      <span className="m-2 text-lg">:</span>
      <input
        {...minutes}
        min={minutes.min ?? 0}
        max={minutes.max ?? 59}
        pattern="^\d*$"
        className={className}
        value={value.minutes}
      />
      <span className="m-2 text-lg">:</span>
      <input
        {...seconds}
        min={seconds.min ?? 0}
        max={seconds.max ?? 59}
        pattern="^\d*$"
        className={className}
        value={value.seconds}
      />
    </div>
  );
}

// Format number boxes
const zStart = RegExp("^0+"); // Remove excess leading zeroes

const padded = ({ value }: { value?: unknown }, digits = 2) =>
  !value
    ? "0".padStart(digits, "0") // Undef/Zero
    : typeof value !== "string"
      ? String(value).padStart(digits, "0") // Number
      : value.replace(zStart, "").padStart(digits, "0"); // String
