import useResetPassword from "./services/reset.service"
import Loading from "../common/Loading"
import { IsResetStyle, PageTitleStyle, ResetFormStyle, TextInput, SubmitButton, GridSpacer } from "./styles/ResetStyles"
import { setupMessage } from "../../assets/alerts"


export default function ResetPassword() {

    const {
        isLoading, error, data,
        username, password, confirm, redBorder,
        changeUsername, changePassword, changeConfirm, handleSubmit,
    } = useResetPassword()

    if (isLoading || error) return <Loading loading={isLoading} error={error} altMsg="Loading" />

    if (data.isSet || !data.valid) return <IsResetStyle {...setupMessage(data)} />

    return (
        <div>
            <PageTitleStyle>{data.isCreate ? "Create Admin" : "Set Password"}</PageTitleStyle>

            <ResetFormStyle onSubmit={handleSubmit}>
            
                <TextInput 
                    id="username"
                    label="Username"
                    value={username}
                    onChange={changeUsername}
                    redBorder={redBorder}
                    isSecret={false}
                />

                <TextInput
                    id="password"
                    label="New Password"
                    value={password}
                    onChange={changePassword}
                    redBorder={redBorder}
                    isSecret={true}
                />

                <TextInput
                    id="confirm"
                    label="Confirm Password"
                    value={confirm}
                    onChange={changeConfirm}
                    redBorder={redBorder}
                    isSecret={true}
                />

                <GridSpacer />
                <SubmitButton value="Submit" disabled={!handleSubmit} />
                <GridSpacer />
                
            </ResetFormStyle>
        </div>
    )
}
