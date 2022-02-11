import React, { useRef } from "react";

import Settings from "./Settings";
import Modal from "../../common/Modal";

function SettingsButton() {
  const modal = useRef(null);

  return (<>
    <h4 className="link" onClick={()=>modal.current.open()}>⚙</h4>

    <Modal ref={modal}>
      <Settings modal={modal} />
    </Modal>
  </>);
}

export default SettingsButton;