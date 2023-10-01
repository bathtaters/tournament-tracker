import React from "react"

export const DateSelectWrapper = ({ children }) => (
    <div className="m-1 flex flex-row flex-wrap justify-center items-center">
        {children}
    </div>
)

export const DateSelectButton = ({ idx, value, onChange, children }) => (
    <button
        type="button"
        className={`btn btn-circle ${value ? 'btn-neutral opacity-70' : 'btn-success'} m-1`}
        onClick={() => onChange(idx)}
    >
        {children}
    </button>
)
