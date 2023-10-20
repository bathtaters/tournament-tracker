import { useState } from "react";
import { useSessionQuery } from "../../common/common.fetch";
import { useLoginMutation, useLogoutMutation } from "../session.fetch";
import { getLocalVar } from "../../common/services/fetch.services";
import { localKeys } from "../../../assets/constants";
import { apiPollMs } from "../../../assets/config";


export function useUserSession() {
    const { data, isLoading } = useSessionQuery(undefined, { skip: !getLocalVar(localKeys.session), pollingInterval: apiPollMs });

    const [ apiLogin,  { isLoading: loginLoading  } ] = useLoginMutation();
    const [ apiLogout, { isLoading: logoutLoading } ] = useLogoutMutation();
    const [ name,     setName ] = useState('');
    const [ password, setPass ] = useState('');

    const login = (ev) => {
        ev.preventDefault();
        apiLogin({ name, password });
        setPass('');
    };
    const logout = () => apiLogout(getLocalVar(localKeys.session));

    return {
        login,
        logout,
        user: data,
        loading: isLoading || loginLoading || logoutLoading,
        nameProps: { value: name,     onChange: (ev) => setName(ev.target.value) },
        passProps: { value: password, onChange: (ev) => setPass(ev.target.value) },
    };
}