import DragBlock from "../../common/DragBlock";
import { NameStyle, PlayerInfoStyle, VsStyle, playerBoxStyle } from "../styles/MatchStyles";
import { dataType } from "../services/swap.services";

import { formatRecord } from '../../../assets/strings';

function MatchPlayer({ id, playerData, matchData, handleSwap, canSwap, isEditing, index, record }) {
  const isDrop = matchData.drops && matchData.drops.includes(id);
  
  return (<>
    { Boolean(index) && <VsStyle>vs.</VsStyle> }

    <DragBlock
      storeData={{ id: matchData.id, playerid: id, reported: matchData.reported }}
      onDrop={handleSwap}
      canDrop={canSwap}
      storeTestData={matchData.id}
      className={playerBoxStyle}
      dataType={dataType}
      disabled={!isEditing}
    >

      <NameStyle linkTo={!isEditing && playerData ? '/profile/'+id : null}>
        {(playerData && playerData.name) || '?'}
      </NameStyle>
      
      <PlayerInfoStyle isDrop={isDrop}>
        { isDrop ? 'Dropped' : formatRecord(record) }
      </PlayerInfoStyle>

    </DragBlock>
  </>);
}

export default MatchPlayer;