import React from "react"
import { boxIDs } from "../../../assets/constants"

export const GeneralSectionStyle = ({ header, children }) => (
    <div className="w-full text-center p-2">
        <h4 className="text-secondary">{header}</h4>
        <span className="font-thin ">{children}</span>
    </div>
)

export const DragBlockWrapper = ({ number, children }) => (
    <div className="w-full flex flex-row items-center">
        {number && <div className="flex-shrink mr-1 text-xl font-medium opacity-60">{number}.</div>}

        {children}
    </div>
)


export const dragEventStyle = (boxId) => 
    `h-12 sm:h-16 m-1 px-2 font-light text-lg ${
        boxId === boxIDs.RANKED ? 'bg-primary-focus text-primary-content hover:bg-primary/80 hover:text-primary-content/80 ' : ''
    }relative flex justify-center items-center flex-grow rounded-xl overflow-hidden text-ellipsis `