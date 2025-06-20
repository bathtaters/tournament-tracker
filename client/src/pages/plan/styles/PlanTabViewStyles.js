import React from "react"
export { GeneralSectionStyle } from "./PlanTabVoteStyles"

const emptyPlaceholder = '...'

export const ViewWrapperStyle = ({ children }) => (
    <div className="flex flex-row flex-wrap justify-center items-stretch gap-4 m-4">
        {children}
    </div>
)

export const ViewCellStyle = ({ header, children }) => (
    <div className="w-56 border border-secondary/70 flex flex-col justify-start items-center py-2 px-4 rounded-md">
        <h4 className=" text-secondary">{header || emptyPlaceholder}</h4>
        {children}
    </div>
)

export const ViewCellSectionStyle = ({ header, children, open = true, ListTag = "ul" }) => (
    <details className="collapse collapse-arrow w-full my-2" open={open}>
        <summary className="collapse-title p-0 min-h-0"><h5>{header || emptyPlaceholder}</h5></summary>
        <ListTag className="collapse-content p-0! min-h-0! font-light list-inside">
            {children}
        </ListTag>
    </details>
)

export const ViewNoDateStyle = () => <i className="opacity-70 font-thin">Available all dates</i>

export const ViewDateStyle = ({ dateRange }) => (
    <li className="list-disc">
        {dateRange.join(' - ')}
    </li>
)

export const ViewEventStyle = ({ title }) => (
    <li className="list-decimal">{title || '-'}</li>
)