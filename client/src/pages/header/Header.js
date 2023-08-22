import React from "react";
import PropTypes from 'prop-types';
import Logo from "./styles/Logo";
import MenuIcon from "../common/icons/MenuIcon";

import ReloadButton from "./components/ReloadButton";
import { HeaderStyle, DropdownStyle, TitleStyle, ReloadStyle, MenuStyle, LinkStyle, headerButtonStyle } from "./styles/HeaderStyles";


function Header({ title }) {
  return (
    <HeaderStyle>
      <DropdownStyle>
        <MenuIcon className={headerButtonStyle} />

        <MenuStyle>
          <LinkStyle to="/home" text="Schedule" />

          <LinkStyle to="/players" text="Players" />
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