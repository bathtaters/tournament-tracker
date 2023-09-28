import React from "react"
import { Navigate } from "react-router-dom"
import Loading from "../common/Loading"
import { IsResetStyle, PageTitleStyle, ResetFormStyle, LockedInput, PasswordInput, SubmitButton, GridSpacer } from "./styles/ResetStyles"
import useResetPassword from "./services/reset.service"


function ResetPassword() {

    const {
        isLoading, error, data, name,
        password, confirm, redBorder, disableBtn,
        changePassword, changeConfirm, handleSubmit,
    } = useResetPassword()


    if (isLoading || error) return <Loading loading={isLoading} error={error} altMsg="Loading" />

    if (data.password) return (
        <IsResetStyle 
            title="Password successfully reset!"
            body="Now use it to sign in at the top right."
            link="Go to home page"
            to="/home"
        />
    )

    if (!data.success) return <Navigate replace to="/home" />

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