import React from "react"

import DragBlock from "../../common/DragBlock"
import { NameStyle, PlayerInfoStyle, PlayerDropStyle, VsStyle, playerBoxStyle } from "../styles/MatchStyles"
import { DropButton } from "../styles/ButtonStyles"
import { dataType } from "../services/swap.services"

import { useLinkId } from "../../common/services/idUrl.services"
import { formatRecord } from '../../../assets/formatting'

function MatchPlayer({ id, playerData, matchData, handleSwap, handleDrop, canSwap, isEditing, index, record }) {
  const playerUrl = useLinkId(id,'profile/')
  const isDrop = matchData.drops && matchData.drops.includes(id)
  const clickDrop = () => handleDrop(id, isDrop)
  
  return (<>
    { Boolean(index) && <VsStyle>vs.</VsStyle> }

    <DragBlock
      storeData={{ id: matchData.id, playerid: id, reported: matchData.players?.length !== 1 && matchData.reported }}
      onDrop={handleSwap}
      canDrop={canSwap}
      storeTestData={id}
      className={playerBoxStyle}
      dataType={dataType}
      disabled={!isEditing}
    >

      <NameStyle linkTo={!isEditing && playerData ? playerUrl : null}>
        {(playerData && playerData.name) || '?'}
      </NameStyle>
      
      <PlayerInfoStyle isDrop={isDrop}>
        { isDrop ? 'Dropped' : formatRecord(record) }

        <PlayerDropStyle visible={isEditing && matchData.reported}>
          <DropButton isDrop={isDrop} onClick={clickDrop} />
        </PlayerDropStyle>
      </PlayerInfoStyle>

    </DragBlock>
  </>)
}

export default MatchPlayer