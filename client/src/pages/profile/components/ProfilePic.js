import React from "react";

import { ProfilePicStyle, defaultPicClass } from "../styles/ProfileStyles";

import { ReactComponent as DefaultProfilePic } from "../../../assets/images/blank-user.svg";

function ProfilePic({ src }) {
  if (!src)
    return (
      <ProfilePicStyle>
        <DefaultProfilePic className={defaultPicClass} />
      </ProfilePicStyle>
    );

  throw Error("Custom pictures not supported yet.");
}

export default ProfilePic;
