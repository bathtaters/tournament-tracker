import React, { useMemo } from "react";
import { useParams } from "react-router-dom";

import ProfilePic from "./components/ProfilePic";
import PlayerDataRow from "./components/PlayerDataRow";
import PlayerEvents from "../playerEvents/PlayerEvents";
import RawData from "../common/RawData";
import Loading from "../common/Loading";

import { WrapperStyle, ProfileStyle, PlayerDataStyle } from "./styles/ProfileStyles";
import profileLayout from "./profile.layout";

import { usePlayerQuery } from "./profile.fetch";
import { urlToId } from "../common/services/idUrl.services";


function Profile() {
  const { id } = useParams();
  const playerId = useMemo(() => urlToId(id), [id]);
  const { data: allPlayers, isLoading, error } = usePlayerQuery();
  const playerData = allPlayers?.[playerId];

  if (isLoading || error || !playerData) return (
    <WrapperStyle>
      <Loading loading={isLoading} error={error} altMsg="Player missing." tagName="h4" />
    </WrapperStyle>
  );

  return (
    <WrapperStyle isTeam={playerData.isteam}>
      <ProfileStyle>

        <ProfilePic />

        <PlayerDataStyle>
          {profileLayout(playerData.isteam).map(row =>
            <PlayerDataRow
              key={row.key}
              rowData={row}
              data={playerData[row.key]}
              id={playerId}
            />
          )}
        </PlayerDataStyle>
      </ProfileStyle>

      <RawData data={playerData} />
      
      <PlayerEvents id={playerId} />

    </WrapperStyle>
  );
}

export default Profile;