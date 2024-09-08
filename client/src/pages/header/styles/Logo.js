import React from "react";
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import logo from "../../../assets/images/logo2024.png"

import { defaultSettings } from "../../common/services/fetch.services";

function Logo({ title, to }) {
  return (
    <Link to={to} className="h-full">
      <img className="h-full w-auto block" src={logo} alt={title || defaultSettings.title} />
      {/* <img className="h-full w-auto hidden dark:block" src={logoDark} alt={title || defaultSettings.title} /> */}
    </Link>
  )
}

Logo.propTypes = { title: PropTypes.string, link: PropTypes.string };

export default Logo;