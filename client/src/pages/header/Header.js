import PropTypes from "prop-types";
import { Modal, useModal } from "../common/Modal";
import Settings from "../settings/Settings";
import MainMenu from "./components/MainMenu";
import LoginMenu from "./components/LoginMenu";
import { HeaderStyle, TitleStyle } from "./styles/HeaderStyles";
import Logo from "./styles/Logo";

function Header({ title }) {
  const { backend, open, close, lock } = useModal();

  return (
    <>
      <HeaderStyle>
        <MainMenu openModal={open} />

        <TitleStyle>
          <Logo to="/home" title={title} />
        </TitleStyle>

        <LoginMenu />
      </HeaderStyle>

      <Modal backend={backend}>
        <Settings close={close} lock={lock} />
      </Modal>
    </>
  );
}

Header.propTypes = { title: PropTypes.string };

export default Header;
