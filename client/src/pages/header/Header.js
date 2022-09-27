import React from "react";
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import MenuIcon from "../common/icons/MenuIcon";
import logo from "../../assets/images/logo.png"

import ReloadButton from "./components/ReloadButton";
import { HeaderStyle, DropdownStyle, TitleStyle, ReloadStyle, MenuStyle, LinkStyle, headerButtonStyle } from "./styles/HeaderStyles";

import { defaultSettings } from "../common/services/fetch.services";



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
        <Link to="/home" className="h-full"><img className="h-full w-auto" src={logo} alt={title || defaultSettings.title} /></Link>
      </TitleStyle>

      <ReloadStyle>
        <ReloadButton className={headerButtonStyle} />
      </ReloadStyle>
    </HeaderStyle>  
  );
}

Header.propTypes = { title: PropTypes.string };

export default Header;