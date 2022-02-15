import React from "react";

import { ProfilePicStyle } from "../styles/ProfileStyles";

import { ReactComponent as DefaultProfilePic } from "../../../assets/images/blank-user.svg";

function ProfilePic({ src }) {
  if (!src) return (<ProfilePicStyle>
    <DefaultProfilePic className="max-w-fit max-h-fit" />
  </ProfilePicStyle>);
  
  throw Error('Custom pictures not supported yet.');
}

export default ProfilePic;