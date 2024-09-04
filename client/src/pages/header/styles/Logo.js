import React from "react";
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import logoLight from "../../../assets/images/logo2024_light.png"
import logoDark from "../../../assets/images/logo2024_dark.png"

import { defaultSettings } from "../../common/services/fetch.services";

function Logo({ title, to }) {
  return (
    <Link to={to} className="h-full">
      <img className="h-full w-auto block dark:hidden" src={logoLight} alt={title || defaultSettings.title} />
      <img className="h-full w-auto hidden dark:block" src={logoDark} alt={title || defaultSettings.title} />
    </Link>
  )
}

Logo.propTypes = { title: PropTypes.string, link: PropTypes.string };

export default Logo;