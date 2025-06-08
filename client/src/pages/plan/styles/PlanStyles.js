import React from "react"
import { PageTitleStyle } from "../../common/styles/CommonStyles"

export const PlanWrapperStyle = ({ children }) => (
    <div className="flex flex-col justify-center items-center gap-2">{children}</div>
)

export const PlanTitleStyle = ({ title, left, right }) => (
    <div className="grid grid-cols-5 w-full">
        {left  || <div />}
        <PageTitleStyle className="col-span-3">{title}</PageTitleStyle>
        {right || <div />}
    </div>
)

export const PlanMessageStyle = ({ children }) => (
    <h3 className="font-thin text-center opacity-80">
        {children}
    </h3>
)

export const PlanErrorStyle = ({ children }) => (
    <p className="font-bold text-center text-error/80">
        {children}
    </p>
)

export const PlanRowStyle = ({ children }) => (
    <div className="w-full flex flex-col sm:flex-row justify-stretch gap-4 my-2">
        {children}
    </div>
)

export const InputWrapperStyle = ({ label, subLabel, children }) => (
    <div className="w-full">
        <label className="label">
            { label && <span className="label-text">{label}</span> }
            { subLabel && <span className="label-text-alt">{subLabel}</span> }
        </label>
        {children}
    </div>
)

export const PlanFooterStyle = ({ children }) => (
    <div className="flex flex-row justify-center gap-4 w-full my-8">{children}</div>
)

export const PlanButton = (props) => (
    <button
        {...props}
        className={`btn btn-sm sm:btn-md grow text-xs sm:text-base ${props.className || 'btn-primary'}`}
    />
)
