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

export const ViewCellSectionStyle = ({ header, children, open = true, emptyHeader, ListTag = "ul" }) => {
    const isEmpty = !children?.length
    return (
        <details className={`collapse my-2 ${isEmpty ? 'pointer-events-none opacity-80' : 'collapse-arrow'}`} open={isEmpty ? false : open}>
            <summary className="collapse-title p-1 after:top-4!">
                <h5>{(isEmpty ? emptyHeader || header : header) || emptyPlaceholder}</h5>
            </summary>
            <ListTag className="collapse-content p-0! min-h-0! font-light list-inside">
                {children}
            </ListTag>
        </details>
    )
}

export const ViewDateStyle = ({ dateRange }) => (
    <li className="list-disc">
        {dateRange.join(' - ')}
    </li>
)

export const ViewEventStyle = ({ title, isRegistered, isUnvoted }) => (
    <li className={isUnvoted ? "list-inside ml-4 opacity-80 italic" : "list-decimal"}>
        {title || '-'}
        {isRegistered && <div aria-label="registered" className="status status-success ml-2" />}
    </li>
)

export const ViewScoreStyle = ({ title, score, children }) => {
    const rounded = Math.round(score * 100)
    return (
        <div className="w-full text-center font-light text-sm mt-2">
            <div
                title={title}
                aria-valuenow={rounded}
                role="progressbar"
                className="radial-progress"
                style={{ "--value": rounded, "--size": "4rem" }}
            >
                {score.toLocaleString(undefined, {
                    style: 'percent',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })}
            </div>
            {children}
        </div>
    )
}