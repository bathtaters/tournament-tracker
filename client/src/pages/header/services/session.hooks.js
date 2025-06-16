import { useState } from "react";
import { useSessionQuery, useSettingsQuery } from "../../common/common.fetch";
import { useLoginMutation, useLogoutMutation } from "../session.fetch";
import { hashText } from "../../common/services/basic.services";
import { useOpenAlert } from "../../common/common.hooks";
import { hasherAlert } from "../../../assets/alerts";
import { apiPollMs } from "../../../assets/config";


export function useUserSession() {
    const openAlert = useOpenAlert();
    const { data, isLoading } = useSessionQuery(undefined, { pollingInterval: apiPollMs });
    const { data: settings, isLoading: sLoad, error: sErr } = useSettingsQuery();

    const [ apiLogin,  { isLoading: loginLoading  } ] = useLoginMutation();
    const [ apiLogout, { isLoading: logoutLoading } ] = useLogoutMutation();
    const [ name,     setName ] = useState('');
    const [ password, setPass ] = useState('');

    const login = async (ev) => {
        ev.preventDefault();
        const hashed = await hashText(password);
        if (!hashed) return openAlert(hasherAlert);
        apiLogin({ name, password: hashed });
        setPass('');
    };
    const logout = () => apiLogout();

    return {
        login,
        logout,
        user: data,
        loading: isLoading || loginLoading || logoutLoading || sLoad,
        enableCredits: sLoad || sErr ? false : settings.showcredits || false,
        nameProps: { value: name,     onChange: (ev) => setName(ev.target.value), autoComplete: "username" },
        passProps: { value: password, onChange: (ev) => setPass(ev.target.value), autoComplete: "current-password" },
    };
}