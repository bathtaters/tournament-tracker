import React, { useRef } from "react";
import PropTypes from "prop-types";
import Modal from "../common/Modal";
import Settings from "../settings/Settings";
import MainMenu from "./components/MainMenu";
import LoginMenu from "./components/LoginMenu";
import { HeaderStyle, TitleStyle } from "./styles/HeaderStyles";
import Logo from "./styles/Logo";


function Header({ title }) {
  const modal = useRef(null);

  return (<>
    <HeaderStyle>
      <MainMenu modal={modal} />

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