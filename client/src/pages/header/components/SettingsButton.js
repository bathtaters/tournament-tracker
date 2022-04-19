import React, { useRef } from "react";

import Settings from "./Settings";
import { settingsClass } from "../styles/HeaderStyles";
import Modal from "../../common/Modal";

function SettingsButton() {
  const modal = useRef(null);

  return (<>
    <input type="button" className={settingsClass} onClick={()=>modal.current.open()} value="⚙" />

    <Modal ref={modal}>
      <Settings modal={modal} />
    </Modal>
  </>);
}

export default SettingsButton;