import React from "react";
import PropTypes from 'prop-types';
import { NavLink } from "react-router-dom";

function Header({ title }) {
  return pug`
    .fixed.top-0.z-20.w-full.alt-bgd.bg-opacity-90.h-24.p-2.flex.justify-around.items-center.px-2
      h4
        NavLink(to="/home" exact=true) Schedule

      h3.base-color.font-medium.text-center.px-2.line-clamp-2.overflow-ellipsis.overflow-hidden= title

      h4
        NavLink(to="/players") Players

    .h-28
  `;
}

Header.propTypes = {
  title: PropTypes.string,
};

export default Header;