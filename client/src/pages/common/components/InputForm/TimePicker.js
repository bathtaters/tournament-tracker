import React, { useEffect } from "react"

function TimePicker({ wrapperClass, className, backend, hours, minutes, seconds }) {

    usePadValue(hours, backend)
    usePadValue(minutes, backend)
    usePadValue(seconds, backend)
    
    return (
        <div className={"join "+wrapperClass}>
            <input
                {...hours}
                id={hours.name}
                type="number"
                min={0} max={23}
                pattern="^\d*$"
                placeholder="00"
                className={className}
            />
            <span className="m-2 text-lg">:</span>
            <input
                {...minutes}
                id={minutes.name}
                type="number"
                min={0} max={59}
                pattern="^\d*$"
                placeholder="00"
                className={className}
            />
            <span className="m-2 text-lg">:</span>
            <input
                {...seconds}
                id={seconds.name}
                type="number"
                min={0} max={59}
                pattern="^\d*$"
                placeholder="00"
                className={className}
            />
        </div>
    )
}

export default TimePicker

// Pad value out to 2 digits
const usePadValue = (props, { set, get }, digits = 2) => {
    // on load
    useEffect(() => {
        set(props.name, String(get(props.name) || "0").padStart(digits, "0"))
    }, [props.name, get, set, digits])

    // on un-focus
    const oldBlur = props.onBlur
    props.onBlur = (ev) => {
        set(props.name, String(ev.target.value || "0").padStart(digits, "0"))
        oldBlur && oldBlur(ev)
    }

    // // on every update
    // const oldChg = props.onChange
    // props.onChange = (ev) => {
    //     set(props.name, String(ev.target.value || "0").padStart(digits, "0"))
    //     oldChg && oldChg(ev)
    // }
}