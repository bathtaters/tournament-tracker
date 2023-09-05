import React from "react"
export { GeneralSectionStyle } from "./PlanTabVoteStyles"

const emptyPlaceholder = '...'

export const ViewWrapperStyle = ({ children }) => (
    <div className="flex flex-row flex-wrap justify-center items-start gap-4 m-4">
        {children}
    </div>
)

export const ViewCellStyle = ({ header, children }) => (
    <div className=" w-56 h-full border border-secondary/70 flex flex-col justify-start items-center py-2 px-4 rounded-md">
        <h4 className=" text-secondary">{header || emptyPlaceholder}</h4>
        {children}
    </div>
)

export const ViewCellSectionStyle = ({ header, children }) => (
    <div className="w-full my-2">
        <h5>{header || emptyPlaceholder}</h5>
        <div className="font-thin">{children}</div>
    </div>
)

export const ViewAllEventsStyle = ({ header, children }) => (
    <ViewCellSectionStyle header={header}>
        <ol>{children}</ol>
    </ViewCellSectionStyle>
)

export const ViewEventStyle = ({ title }) => (
    <li>{title || emptyPlaceholder}</li>
)