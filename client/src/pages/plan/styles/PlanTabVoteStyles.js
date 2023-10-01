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
        {number && <div className="flex-shrink mr-1 text-xl font-medium opacity-60 ">{number}.</div>}

        {children}
    </div>
)


export const dragEventStyle = (boxId) => 
    `h-12 sm:h-16 m-1 px-2 font-light text-lg ${
        boxId === boxIDs.RANKED ? 'bg-primary-focus text-primary-content hover:bg-primary/80 hover:text-primary-content/80 ' : ''
    }relative flex justify-center items-center flex-grow rounded-xl overflow-hidden text-ellipsis `


export const SideButtonWrapper = ({ hide, children }) => (
    <div className={`join join-horizontal md:hidden rounded-lg${hide ? ' invisible' : ''}`}>
        {children}
    </div>
)

export const SideButton = (props) => (
    <button type="button" className={`btn btn-primary btn-sm md:btn-xs join-item md:btn-ghost${props.onClick ? '' : ' invisible'}`} {...props} />
)

export const OverlayButton = (props) => (
    <div className="absolute top-0 bottom-0 left-0 right-0 z-10 opacity-0 hover:opacity-100 md:hover:opacity-0 flex justify-start items-center pl-1">
        <button type="button" className="btn btn-circle btn-sm btn-rror bg-opacity-70" disabled={!props.onClick} {...props} />
    </div>
)

    