import React from "react";
import PropTypes from 'prop-types';
import Logo from "./styles/Logo";
import MenuIcon from "../common/icons/MenuIcon";

import ReloadButton from "./components/ReloadButton";
import { HeaderStyle, DropdownStyle, TitleStyle, MenuStyle, MenuLinkStyle, headerButtonStyle, MenuItemStyle } from "./styles/HeaderStyles";


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

      <ReloadStyle>
        <ReloadButton className={headerButtonStyle} />
      </ReloadStyle>
    </HeaderStyle>  
  );
}

Header.propTypes = { title: PropTypes.string };

export default Header;