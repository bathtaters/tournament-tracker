import React from "react"
import { Link } from "react-router-dom"
export { PageTitleStyle } from "../../common/styles/CommonStyles"


export const IsResetStyle = ({ title, body, link, to }) => (
    <div className="font-thin text-center flex flex-col p-2 gap-4">
        <h3>{title}</h3>
        <p>{body}</p>
        <Link className="link link-hover link-secondary" to={to}>{link}</Link>
    </div>
)


export const ResetFormStyle = (props) => (
    <form className="w-full grid grid-cols-4 items-center gap-2 px-8 py-2" {...props} />
)


export const LockedInput = ({ label, value }) => (<>
    <label className="label justify-end font-light w-full" aria-disabled={true}>{label}</label>
    <div className="input col-span-3 w-full cursor-default">
        {value}
    </div>
</>)


export const PasswordInput = ({ id, label, redBorder, value, onChange }) => (<>
    <label className="label justify-end font-light w-full" htmlFor={id}>{label}</label>
    <input
        id={id}
        type="password"
        className={`input bg-base-200 input-primary col-span-3 w-full ${redBorder === id ? 'border-error' : ''}`}
        autoComplete="new-password"
        value={value}
        onChange={onChange}
    />
</>)


export const SubmitButton = (props) => (
    <input type="submit" className="btn btn-primary mt-4 col-span-2" {...props} />
)


export const GridSpacer = () => <div />