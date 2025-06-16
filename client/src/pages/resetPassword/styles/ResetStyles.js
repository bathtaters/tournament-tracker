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


export const TextInput = ({ id, label, redBorder, value, onChange, isSecret }) => (<>
    <label className="label justify-end font-light w-full" htmlFor={id}>{label}</label>
    <input
        id={id}
        type={isSecret ? "password" : "text"}
        className={`input ${onChange ? 'input-primary ' : ''}${redBorder === id ? 'border-error ' : ''} bg-base-200 w-full col-span-3`}
        autoComplete={isSecret ? "new-password" : "username"}
        value={value}
        onChange={onChange}
        disabled={!onChange}
    />
</>)


export const SubmitButton = (props) => (
    <input type="submit" className="btn btn-primary mt-4 col-span-2" {...props} />
)


export const GridSpacer = () => <div />