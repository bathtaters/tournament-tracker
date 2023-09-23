import React from "react"

export default function RangeSelector({ wrapperClass, boxClass, className, ...inputProps }) {
    return (
        <div className={`flex ${wrapperClass || "w-full flex-row"}`}>
            <input type="range" className={`range flex-grow ${className || 'range-primary'}`} {...inputProps} />
            <div className={`flex-shrink ${boxClass || 'border border-primary ml-2 text-center w-8'}`}>{inputProps.value || '-'}</div>
        </div>
    )
}