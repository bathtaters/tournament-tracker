import { useCallback, useEffect, useState } from "react"
import { usePlayerQuery, useResetSessionQuery, useCreatePlayerMutation, useUpdatePlayerMutation } from "../../profile/profile.fetch"
import { useParamIds } from "../../common/services/idUrl.services"

import { getBaseData } from "../../../core/services/validation.services"
import { useNavigate } from "react-router-dom"
export const { min, max } = getBaseData('player').limits.password


export default function useResetPassword() {
    const navigate = useNavigate()
    const params = useParamIds('id','session')

    const [ username,  setUsername  ] = useState('')
    const [ password,  setPassword  ] = useState('')
    const [ confirm,   setConfirm   ] = useState('')
    const [ redBorder, setRedBorder ] = useState('')

    const isCreate = !params.session
    const disableBtn = redBorder || !password || !confirm || (!params.id && !username)

    const { data: player, isLoading: playerLoading } = usePlayerQuery(params.id, { skip: !params.id })
    const { data, isLoading, error } = useResetSessionQuery(params, { refetchOnFocus: true, refetchOnReconnect: true, refetchOnMountOrArgChange: true })

    const [ createPlayer, { isLoading: createLoading, error: createError } ] = useCreatePlayerMutation()
    const [ updatePlayer, { isLoading: updateLoading, error: updateError } ] = useUpdatePlayerMutation()

    const updateBorder = useCallback((password, confirm) => {
        if (password && (password.length < min || password.length > max)) setRedBorder('password')
        else if (confirm && password !== confirm) setRedBorder('confirm')
        else setRedBorder('')
    }, [])

    const handleSubmit = disableBtn ? null : () => {
        if (!isCreate) updatePlayer({ id: params.id, password })
        else createPlayer({ name: username, password, access: 3 })
    }

    // Force redirect if visiting page when a user has already been created
    const redirect = Boolean(isCreate && !username && data?.isSet)
    useEffect(() => { if (redirect) navigate("/", { replace: true }) }, [redirect, navigate])

    return {
        data,
        error: error || createError || updateError,
        isLoading: isLoading || createLoading || updateLoading || (!isCreate && playerLoading) || !data,
        
        username: player?.name || (isCreate ? username : '...'),
        password, confirm, redBorder,
        handleSubmit,
        changeUsername: isCreate ? (ev) => { setUsername(ev.target.value) } : null,
        changePassword: (ev) => { setPassword(ev.target.value); updateBorder(ev.target.value, confirm)  },
        changeConfirm:  (ev) => { setConfirm(ev.target.value);  updateBorder(password, ev.target.value) },
    }
}
