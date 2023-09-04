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
import { usePlanSettings } from "../plan/services/plan.utils";


function Header({ title }) {
  const modal = useRef(null);
  const { access, settings, voter } = usePlanSettings();

  const planIsVisible = access > 2 || settings.planstatus === 3 || (settings.planstatus === 2 ? voter : access > 1);

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