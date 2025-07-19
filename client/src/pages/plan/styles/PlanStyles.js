import { PageTitleStyle } from "../../common/styles/CommonStyles"
import { ElementStyle } from "../../common/styles/InputFormStyles"
import { titleStyle } from "../../common/EditableList/styles/EditableListStyles"

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
    <div className="w-full flex flex-col sm:flex-row justify-stretch gap-0 md:gap-4 my-2">
        {children}
    </div>
)

export const PlanErrors = ({ errors }) => !errors?.length ? null : (
    <div className="flex justify-center items-center gap-2 mt-4">
        <h4 className="text-error">Errors:</h4>
        {errors.map((msg) => <div className="badge badge-error">{msg}</div>)}
    </div>
)

export const InputWrapperStyle = ({ label, children }) => (
    <ElementStyle label={label} isFloating={false} labelClass={titleStyle}>
        {children}
    </ElementStyle>
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
