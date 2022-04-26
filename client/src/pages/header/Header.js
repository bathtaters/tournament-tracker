import React from "react";
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import MenuIcon from "../common/icons/MenuIcon";

import ReloadButton from "./components/ReloadButton";
import { HeaderStyle, DropdownStyle, TitleStyle, ReloadStyle, MenuStyle, LinkStyle, headerButtonStyle } from "./styles/HeaderStyles";

import valid from "../../assets/validation.json";
const defaultTitle = valid.defaults.settings.title;



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
        <Link to="/home">{title || defaultTitle}</Link>
      </TitleStyle>

      <ReloadStyle>
        <ReloadButton className={headerButtonStyle} />
      </ReloadStyle>
    </HeaderStyle>  
  );
}

Header.propTypes = { title: PropTypes.string };

export default Header;