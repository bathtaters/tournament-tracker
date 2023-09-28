import { useEffect, useState } from "react"
import { useParamIds } from "../../common/services/idUrl.services"
import { usePlayerQuery, useCanResetQuery, useUpdatePlayerMutation } from "../../profile/profile.fetch"

import { getBaseData } from "../../../core/services/validation.services";
export const { min, max } = getBaseData('player').limits.password


export default function useResetPassword() {
    const params = useParamIds('id','session')
    const { data: player, isLoading: playerLoading } = usePlayerQuery(params.id, { skip: !params?.id })
    const { data, isLoading, error } = useCanResetQuery(params, { skip: !params?.id, refetchOnFocus: true, refetchOnReconnect: true, refetchOnMountOrArgChange: true })
    const [ updatePlayer, { isLoading: isUpdating } ] = useUpdatePlayerMutation()

    const [ password,  setPassword  ] = useState('')
    const [ confirm,   setConfirm   ] = useState('')
    const [ redBorder, setRedBorder ] = useState('')

    useEffect(() => {
        if (password && (password.length < min || password.length > max)) setRedBorder('password')
        else if (confirm && password !== confirm) setRedBorder('confirm')
        else setRedBorder('')
    }, [password, confirm])

    const handleSubmit = () => {
        if (password.length < min || password.length > max || password !== confirm) return
        return updatePlayer({ id: params.id, password })
    }

    return {
        isLoading: isLoading || isUpdating || playerLoading || !data,
        error,
        data,

        name: player?.name || '...',
        
        password,
        confirm,
        redBorder,

        disableBtn: redBorder || !password || !confirm,

        changePassword: (ev) => setPassword(ev.target.value),
        changeConfirm: (ev) => setConfirm(ev.target.value),
        handleSubmit,
    }
}
