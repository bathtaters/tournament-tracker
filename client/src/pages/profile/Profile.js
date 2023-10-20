import React from "react";

import ProfilePic from "./components/ProfilePic";
import ResetLink from "./components/ResetLink";
import PlayerDataRow from "./components/PlayerDataRow";
import PlayerEvents from "../playerEvents/PlayerEvents";
import RawData from "../common/RawData";
import Loading from "../common/Loading";

import { WrapperStyle, ProfileStyle, PlayerDataStyle, PicColumnStyle } from "./styles/ProfileStyles";
import profileLayout, { WRITE, getProfileACL } from "./profile.layout";

import { usePlayerQuery } from "./profile.fetch";
import { useSessionState } from "../common/common.fetch";
import { useParamIds } from "../common/services/idUrl.services";
import { apiPollMs } from "../../assets/config";


function Profile() {
  const { id } = useParamIds('id');
  const { data: allPlayers, isLoading, error } = usePlayerQuery(undefined, { pollingInterval: apiPollMs });
  const playerData = allPlayers?.[id];
  
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

        <PicColumnStyle>
          <ProfilePic />

          <ResetLink link={playerData.resetlink} />
        </PicColumnStyle>

        <PlayerDataStyle>
          {profileLayout(playerData.isteam).map((row) =>
            <PlayerDataRow
              key={row.id}
              rowData={row}
              data={playerData[row.id]}
              id={id}
              access={acl[row.id]}
            />
          )}
          { acl.reset &&
            <PlayerDataRow
              id={id}
              rowData={{ label: 'Password',  id: 'reset', disabled: !!playerData.resetlink }}
              access={WRITE}
            />
          }
        </PlayerDataStyle>
      </ProfileStyle>

      <RawData data={playerData} />
      <RawData data={acl} />
      
      <PlayerEvents id={id} />

    </WrapperStyle>
  );
}

export default Profile;