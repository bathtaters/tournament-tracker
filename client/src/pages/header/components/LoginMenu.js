import React from "react";
import RawData from "../../common/RawData";
import {
  DropdownButton,
  DropdownInput,
  LoginMenuStyle,
  MenuLinkStyle,
  MenuCreditsStyle,
} from "../styles/LoginStyles";
import { useUserSession } from "../services/session.hooks";
import { idToUrl } from "../../common/services/idUrl.services";

function LoginMenu() {
  const { login, logout, user, loading, nameProps, passProps, enableCredits } =
    useUserSession();

  if (user?.id)
    return (
      <LoginMenuStyle
        loading={loading}
        initial={user.name.charAt(0).toUpperCase()}
      >
        <MenuLinkStyle to={`/profile/${idToUrl(user.id)}`}>
          {user.name}
        </MenuLinkStyle>
        {enableCredits && <MenuCreditsStyle value={user?.credits} />}
        <RawData data={user} />
        <DropdownButton onClick={logout}>Logout</DropdownButton>
      </LoginMenuStyle>
    );

  return (
    <LoginMenuStyle loading={loading} onSubmit={login}>
      <DropdownInput label="Username" props={nameProps} />
      <DropdownInput label="Password" props={passProps} />
      <DropdownButton>Login</DropdownButton>
    </LoginMenuStyle>
  );
}

export default LoginMenu;
