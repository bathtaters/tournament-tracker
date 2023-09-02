import React, { useRef } from "react";
import PropTypes from "prop-types";
import Modal from "../common/Modal";
import Settings from "../settings/Settings";
import LoginMenu from "./components/LoginMenu";
import ReloadButton from "./components/ReloadButton";
import { HeaderStyle, DropdownStyle, TitleStyle, MenuStyle, MenuLinkStyle, headerButtonStyle, MenuItemStyle } from "./styles/HeaderStyles";
import Logo from "./styles/Logo";
import MenuIcon from "../common/icons/MenuIcon";
import SettingsIcon from "../common/icons/SettingsIcon";
import { useAccessLevel } from "../common/common.fetch";


function Header({ title }) {
  const modal = useRef(null);
  const access = useAccessLevel();

  /* Check if admin && planVisible OR if player && planVote && player in plan */
  const planIsVisible = true

  return (<>
    <HeaderStyle>
      <DropdownStyle>
        <MenuIcon className={headerButtonStyle} />

        <MenuStyle>
          { planIsVisible && <MenuLinkStyle to="/plan">Plan</MenuLinkStyle> }

          <MenuLinkStyle to="/home">Schedule</MenuLinkStyle>

          <MenuLinkStyle to="/players">Players</MenuLinkStyle>

          <MenuItemStyle><ReloadButton /></MenuItemStyle>

          {access > 2 && <MenuLinkStyle onClick={() => modal.current.open()}>Settings <SettingsIcon /></MenuLinkStyle>}
        </MenuStyle>
      </DropdownStyle>

      <TitleStyle>
        <Logo to="/home" title={title} />
      </TitleStyle>

      <LoginMenu />
    </HeaderStyle>  

    <Modal ref={modal}>
      <Settings modal={modal} />
    </Modal>
  </>);
}

Header.propTypes = { title: PropTypes.string };

export default Header;