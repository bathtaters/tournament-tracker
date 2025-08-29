import { Modal, useModal } from "pages/common/Modal";
import Settings from "pages/settings/Settings";
import MainMenu from "./components/MainMenu";
import LoginMenu from "./components/LoginMenu";
import { HeaderStyle, TitleStyle } from "./styles/HeaderStyles";
import Logo from "./styles/Logo";

export default function Header({ title }: { title?: string }) {
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
