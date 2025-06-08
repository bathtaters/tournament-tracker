import React from "react"

export default function RangeSelector({ wrapperClass, boxClass, className, ...inputProps }) {
    return (
        <div className={`flex ${wrapperClass || "w-full flex-row"}`}>
            <input type="range" className={`range grow ${className || 'range-primary'}${inputProps.disabled ? ' cursor-not-allowed' : ''}`} {...inputProps} />
            <div className={`shrink ${boxClass || 'border border-primary ml-2 text-center w-8'}`}>{inputProps.value || '-'}</div>
        </div>
    )
}