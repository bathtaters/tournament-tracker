import React from "react";
import PropTypes from 'prop-types';

import SettingsButton from "./components/SettingsButton";
import ReloadButton from "./components/ReloadButton";
import { HeaderStyle, TitleStyle, LinkStyle, OverlayStyle } from "./styles/HeaderStyles";

const defaultTitle = import("../../assets/validation.json")
  .then(v => v.defaults.settings.title);

function Header({ title }) {
  return (
    <HeaderStyle>

      <LinkStyle to="/home" text="Schedule" />

      <TitleStyle title={title || defaultTitle} />

      <LinkStyle to="/players" text="Players" />

      <OverlayStyle edge="left">
        <SettingsButton />
      </OverlayStyle>

      <OverlayStyle edge="right">
        <ReloadButton />
      </OverlayStyle>

    </HeaderStyle>  
  );
}

Header.propTypes = { title: PropTypes.string };

export default Header;