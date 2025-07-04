
export default function TimePicker({ inputProps: { hours, minutes, seconds }, wrapperClass, className }) {
    
    return (
        <div className={`join ${wrapperClass}`}>
            <input
                {...hours}
                min={hours.min ?? 0}
                max={hours.max ?? 23}
                pattern="^\d*$"
                placeholder="00"
                className={className}
                value={padded(hours)}
            />
            <span className="m-2 text-lg">:</span>
            <input
                {...minutes}
                min={minutes.min ?? 0}
                max={minutes.max ?? 59}
                pattern="^\d*$"
                placeholder="00"
                className={className}
                value={padded(minutes)}
            />
            <span className="m-2 text-lg">:</span>
            <input
                {...seconds}
                min={seconds.min ?? 0}
                max={seconds.max ?? 59}
                pattern="^\d*$"
                placeholder="00"
                className={className}
                value={padded(seconds)}
            />
        </div>
    )
}

// Format number boxes
const zStart = RegExp('^0+') // Remove excess leading zeroes

const padded = ({ value }, digits = 2) => !value && value !== 0 ? '' :  // Undef
    typeof value !== 'string' ? String(value).padStart(digits, "0") :   // Number
        value.replace(zStart, '').padStart(digits, "0")                 // String
