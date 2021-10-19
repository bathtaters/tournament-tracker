import React from "react";
import { useParams } from "react-router-dom";
import {ReactComponent as ProfilePic} from "../assets/blank-user.svg";
import PropTypes from 'prop-types';

function Profile({ data }) {
  let { id } = useParams();
  return pug`
    h3.font-thin User Profile
    .flex
      div
        ProfilePic.w-36.h-40.bg-gray-500.m-2.inline-block()
        .text-center.text-xs.italic.dim-color.font-light= 'id: ' + id

      div
        .grid.grid-flow-row.gap-x-2.gap-y-1.grid-cols-3.items-baseline
          h4.text-right.base-color.font-thin Name

          h4.base-color= data[id].name

          a.text-right.font-light.text-xs(href="#change-name") change
  `;
}

Profile.propTypes = {
  data: PropTypes.object,
};

export default Profile;