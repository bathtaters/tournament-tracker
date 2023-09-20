import React from "react";

export const TooltipWrapperStyle = (props) => <div {...props} className={`relative group ${props.className}`} />

export const TooltipStyle = (props) => (
    <div  {...props} className={
        `absolute top-full left-[5%] right-[5%] z-10 mt-2 p-2 bg-base-300 rounded-lg
        opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${props.className || ""}
        after:content-[""] after:absolute after:w-0 after:h-0
        after:top-0 after:left-1/2 after:mt-[-10px] after:ml-[-10px]
        after:border-[10px] after:border-t-0 after:border-transparent after:border-b-base-300`
    } />
)