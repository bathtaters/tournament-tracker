import React from "react"

export const GeneralSectionStyle = ({ header, children }) => (
    <div className="w-full text-center p-2">
        <h4 className="text-secondary">{header}</h4>
        <span className="font-thin ">{children}</span>
    </div>
)
