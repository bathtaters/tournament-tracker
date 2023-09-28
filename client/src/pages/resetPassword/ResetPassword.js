import React from "react"
import Loading from "../common/Loading"
import { IsResetStyle, PageTitleStyle, ResetFormStyle, LockedInput, PasswordInput, SubmitButton, GridSpacer } from "./styles/ResetStyles"
import useResetPassword from "./services/reset.service"
import { resetPwordSuccess, resetPwordExpired } from "../../assets/alerts"


function ResetPassword() {

    const {
        isLoading, error, data, name,
        password, confirm, redBorder, disableBtn,
        changePassword, changeConfirm, handleSubmit,
    } = useResetPassword()

    if (isLoading || error) return <Loading loading={isLoading} error={error} altMsg="Loading" />

    if (data.isSet) return <IsResetStyle {...resetPwordSuccess} />
    if (!data.valid) return <IsResetStyle {...resetPwordExpired} />

    return (
        <div>
            <PageTitleStyle>Set Password</PageTitleStyle>

            <ResetFormStyle onSubmit={handleSubmit}>
            
                <LockedInput label="Username" value={name} />

                <PasswordInput
                    id="password"
                    label="New Password"
                    value={password}
                    onChange={changePassword}
                    redBorder={redBorder}
                />

                <PasswordInput
                    id="confirm"
                    label="Confirm Password"
                    value={confirm}
                    onChange={changeConfirm}
                    redBorder={redBorder}
                />

                <GridSpacer />
                <SubmitButton value="Submit" disabled={disableBtn} />
                <GridSpacer />
                
            </ResetFormStyle>
        </div>
    )
}

export default ResetPassword