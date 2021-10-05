import React from "react";
import { NavLink } from "react-router-dom";

function Header() {
  return pug`
    .fixed.top-0.w-full.bg-gray-600.bg-opacity-90.h-20.flex.justify-around.items-center
      h4
        NavLink(to="/home" exact=true) Schedule

      h3.text-gray-100.font-medium.text-center.p-2 Lords of Luxury Retreat 2021

      h4
        NavLink(to="/profile") Profile

    .h-24
  `;
}
export default Header;