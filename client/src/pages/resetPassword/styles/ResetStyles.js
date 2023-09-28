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
    <label className="label">
        <h4 className="label-text text-lg font-thin text-right w-full">{label}</h4>
    </label>
    <div className="col-span-3 bordered font-light border border-base-content/50 py-2 px-3 cursor-default">
        {value}
    </div>
</>)


export const PasswordInput = ({ id, label, redBorder, value, onChange }) => (<>
    <label className="label" htmlFor={id}>
        <h4 className="label-text text-lg font-thin text-right w-full">{label}</h4>
    </label>

    <input
        id={id}
        type="password"
        className={`input input-primary input-bordered min-w-0 col-span-3 ${redBorder === id ? 'border-error' : ''}`}
        value={value}
        onChange={onChange}
    />
</>)


export const SubmitButton = (props) => (
    <input type="submit" className="btn btn-primary mt-4 col-span-2" {...props} />
)


export const GridSpacer = () => <div />