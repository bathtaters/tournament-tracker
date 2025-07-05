import { eventWithValue, useParentFocus } from "../../services/basic.services"


export default function TimePicker({ inputProps: { onBlur, hours, minutes, seconds }, wrapperClass, className }) {
    const value = { hours: padded(hours), minutes: padded(minutes), seconds: padded(seconds) }

    const listeners = useParentFocus(null, onBlur && ((ev) => onBlur(eventWithValue(ev, value))))

    return (
        <div className={`join ${wrapperClass}`} {...listeners}>
            <input
                {...hours}
                min={hours.min ?? 0}
                max={hours.max ?? 23}
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
    )
}

// Format number boxes
const zStart = RegExp('^0+') // Remove excess leading zeroes

const padded = ({ value }, digits = 2) => !value ? '00' :               // Undef/Zero
    typeof value !== 'string' ? String(value).padStart(digits, "0") :   // Number
        value.replace(zStart, '').padStart(digits, "0")                 // String
