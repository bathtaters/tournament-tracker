import React from "react";

import ProfilePic from "./components/ProfilePic";
import PlayerDataRow from "./components/PlayerDataRow";
import PlayerEvents from "../playerEvents/PlayerEvents";
import RawData from "../common/RawData";
import Loading from "../common/Loading";

import { WrapperStyle, ProfileStyle, PlayerDataStyle } from "./styles/ProfileStyles";
import profileLayout, { getProfileACL } from "./profile.layout";

import { usePlayerQuery } from "./profile.fetch";
import { useSessionState } from "../common/common.fetch";
import { useParamId } from "../common/services/idUrl.services";


function Profile() {
  const playerId = useParamId('id');
  const { data: allPlayers, isLoading, error } = usePlayerQuery();
  const playerData = allPlayers?.[playerId];
  
  const { data: user } = useSessionState();
  const acl = getProfileACL(user || undefined, playerData || undefined);

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
              access={acl[row.key]}
            />
          )}
        </PlayerDataStyle>
      </ProfileStyle>

      <RawData data={playerData} />
      <RawData data={acl} />
      
      <PlayerEvents id={playerId} />

    </WrapperStyle>
  );
}

export default Profile;