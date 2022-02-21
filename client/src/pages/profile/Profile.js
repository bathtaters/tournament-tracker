import React from "react";
import { useParams } from "react-router-dom";

import ProfilePic from "./components/ProfilePic";
import PlayerDataRow from "./components/PlayerDataRow";
import PlayerEvents from "../playerEvents/PlayerEvents";
import RawData from "../common/RawData";
import Loading from "../common/Loading";

import { WrapperStyle, ProfileStyle, PlayerDataStyle } from "./styles/ProfileStyles";
import profileLayout from "./profile.layout";

import { usePlayerQuery } from "./profile.fetch";


function Profile() {
  const { id } = useParams();
  const { data: playerData, isLoading, error } = usePlayerQuery();

  if (isLoading || error || !playerData || !playerData[id]) return (
    <WrapperStyle>
      <Loading loading={isLoading} error={error} altMsg="Player missing." tagName="h4" />
    </WrapperStyle>
  );

  return (
    <WrapperStyle isTeam={playerData[id].isteam}>
      <ProfileStyle>

        <ProfilePic />

        <PlayerDataStyle>
          {profileLayout(playerData[id].isteam).map(row =>
            <PlayerDataRow
              key={row.key}
              rowData={row}
              data={playerData[id][row.key]}
              id={id}
            />
          )}
        </PlayerDataStyle>
      </ProfileStyle>

      <RawData data={playerData[id]} />
      
      <PlayerEvents id={id} />

    </WrapperStyle>
  );
}

export default Profile;