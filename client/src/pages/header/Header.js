import React from "react";
import PropTypes from 'prop-types';

import SettingsButton from "./components/SettingsButton";
import ReloadButton from "./components/ReloadButton";
import { HeaderStyle, TitleStyle, LinkStyle, LinkContainer, OverlayStyle } from "./styles/HeaderStyles";

import valid from "../../assets/validation.json";
const defaultTitle = valid.defaults.settings.title;

function Header({ title }) {
  return (
    <HeaderStyle>

      <SettingsButton />

      <TitleStyle title={title || defaultTitle} />

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