import React, { useRef } from "react";
import PropTypes from 'prop-types';
import { NavLink } from "react-router-dom";

import Settings from "../components/header/Settings";
import ReloadButton from "../components/header/ReloadButton";
import Modal from "../components/shared/Modal";

const defaultTitle = "Tournament Tracker";

function Header({ title }) {
  const modal = useRef(null);

  return (<>
    <div
      className="fixed top-0 z-20 w-full alt-bgd bg-opacity-90 h-24 p-2 flex justify-around items-center px-2"
    >
      <h4>
        <NavLink to="/home">Schedule</NavLink>
      </h4>

      <h3
        className="base-color font-medium text-center px-2 line-clamp-2 text-ellipsis overflow-hidden"
      >
        {title || defaultTitle}
      </h3>

      <h4>
        <NavLink to="/players">Players</NavLink>
      </h4>

      <div className="absolute top-0 left-0 z-30 m-2">
        <h4 className="link" onClick={()=>modal.current.open()}>⚙</h4>
      </div>

      <div className="absolute top-0 right-0 z-30 m-2">
        <ReloadButton className="dimmer-border" size={4} />
      </div>

    </div>

    <div className="h-28">
      <Modal ref={modal}>
        <Settings
          hideModal={force=>modal.current.close(force)}
          lockModal={()=>modal.current.lock()}
        />
      </Modal>
    </div>
  </>);
}

Header.propTypes = { title: PropTypes.string };

export default Header;