import React from "react";
import { useParams } from "react-router-dom";
import {ReactComponent as ProfilePic} from "../assets/blank-user.svg";
import PropTypes from 'prop-types';

function Profile(props) {
  let { id } = useParams();
  if (!id) id = props.activeUser; 
  const edit = props.activeUser === id ? "" : "hidden";
  return pug`
    h3.font-thin User Profile
    .flex
      div
        ProfilePic.w-36.h-40.bg-gray-400.m-2.inline-block()
        .text-center.text-xs.italic.text-gray-600.font-light= 'id: ' + id

      div
        .grid.grid-flow-row.gap-x-2.gap-y-1(className="grid-cols-"+(props.activeUser === id ? 3 : 2))
          h4.text-right.text-gray-200.font-thin Name

          h4.text-gray-200= props.data[id].name

          a.text-right.font-light.text-sm(href="#change-name" className=edit) Change

          .text-right.text-sm.font-thin.mr-1 Username

          .text-sm= props.data[id].username

          a.text-right.font-light.text-sm(href="#change-un" className=edit) Change

          a.col-span-3.font-light.text-xs.italic.text-center.mt-2(href="#change-pw" className=edit) Change Password
  `;
}

Profile.propTypes = {
  data: PropTypes.object,
  activeUser: PropTypes.string,
};

export default Profile;