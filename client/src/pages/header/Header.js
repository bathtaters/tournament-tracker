import React from "react";
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";

import ReloadButton from "./components/ReloadButton";
import { HeaderStyle, TitleStyle, LinkStyle, LinkContainer, OverlayStyle } from "./styles/HeaderStyles";

import valid from "../../assets/validation.json";
const defaultTitle = valid.defaults.settings.title;

function Header({ title }) {
  return (
    <HeaderStyle>

      <TitleStyle>
        <Link to="/home">{title || defaultTitle}</Link>
      </TitleStyle>

      <LinkContainer>
        <LinkStyle to="/home" text="Schedule" />

        <LinkStyle to="/players" text="Players" />
      </LinkContainer>

      <OverlayStyle edge="right">
        <ReloadButton />
      </OverlayStyle>

    </HeaderStyle>  
  );
}

Header.propTypes = { title: PropTypes.string };

export default Header;