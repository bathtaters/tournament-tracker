import React from "react";
import PropTypes from "prop-types";
import LoginMenu from "./components/LoginMenu";
import ReloadButton from "./components/ReloadButton";
import { HeaderStyle, DropdownStyle, TitleStyle, MenuStyle, MenuLinkStyle, headerButtonStyle, MenuItemStyle } from "./styles/HeaderStyles";
import Logo from "./styles/Logo";
import MenuIcon from "../common/icons/MenuIcon";



function Header({ title }) {
  return (
    <HeaderStyle>
      <DropdownStyle>
        <MenuIcon className={headerButtonStyle} />

        <MenuStyle>
          <MenuLinkStyle to="/home" text="Schedule" />

          <MenuLinkStyle to="/players" text="Players" />

          <MenuItemStyle><ReloadButton /></MenuItemStyle>
        </MenuStyle>
      </DropdownStyle>

      <TitleStyle>
        <Logo to="/home" title={title} />
      </TitleStyle>

      <LoginMenu />
    </HeaderStyle>  
  );
}

Header.propTypes = { title: PropTypes.string };

export default Header;