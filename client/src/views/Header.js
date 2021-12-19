import React, { useRef } from "react";
import PropTypes from 'prop-types';
import { NavLink } from "react-router-dom";

import ReloadButton from "./Components/ReloadButton";
import Modal from "./Components/Modal";
import Settings from "./Components/Settings";

const defaultTitle = "Tournament Tracker";

function Header({ title }) {
  const modal = useRef(null);

  return pug`
    .fixed.top-0.z-20.w-full.alt-bgd.bg-opacity-90.h-24.p-2.flex.justify-around.items-center.px-2
      h4
        NavLink(to="/home" exact=true) Schedule

      h3.base-color.font-medium.text-center.px-2.line-clamp-2.overflow-ellipsis.overflow-hidden= title || defaultTitle

      h4
        NavLink(to="/players") Players
      
      .absolute.top-0.left-0.z-30.m-2
        h4.link(onClick=(()=>modal.current.open())) ⚙

      .absolute.top-0.right-0.z-30.m-2
        ReloadButton.dimmer-border(size=4)

    .h-28
      Modal(ref=modal)
        Settings(hideModal=(()=>modal.current.close()))
  `;
}

Header.propTypes = { title: PropTypes.string };

export default Header;