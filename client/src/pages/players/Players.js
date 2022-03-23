import React, { useState, useRef, useCallback } from "react";

import AddPlayer from "./components/AddPlayer";
import Stats from "../stats/Stats";
import Modal from "../common/Modal";
import { TitleStyle, StatsStyle, FooterStyle, statsClass } from "./styles/PlayerStyles";
import { AddButton, RemoveButton } from "./styles/ButtonStyles";

import { useOpenAlert } from "../common/common.hooks";
import { playerClickController } from "./services/player.services";
import { useSettingsQuery, useDeletePlayerMutation } from "./player.fetch";


function Players() {
  // Init view
  const modal = useRef(null);
  const { data: settings } = useSettingsQuery();
  const [ deletePlayer ] = useDeletePlayerMutation();

  // Local state
  const [canDelete, setDeleteMode] = useState(false);
  const toggleDelete = () => setDeleteMode(!canDelete);
  
  // Actions
  const openAlert = useOpenAlert();
  const handlePlayerClick = useCallback(
    playerClickController(canDelete, deletePlayer, openAlert), [canDelete, deletePlayer, openAlert]
  );

  return (
    <div>
      <TitleStyle>Player Stats</TitleStyle>

      <StatsStyle>
        <Stats
          className={statsClass.base(canDelete)}
          highlightClass={statsClass.hover(canDelete)}
          onPlayerClick={handlePlayerClick}
          hideTeams={true}
        />
      </StatsStyle>

      <FooterStyle>
        <AddButton disabled={canDelete} onClick={()=>modal.current.open()} />
        { settings && settings.showadvanced && 
          <RemoveButton onClick={toggleDelete} canDelete={canDelete} />
        }
      </FooterStyle>

      <Modal ref={modal}>
        <AddPlayer modal={modal} />
      </Modal>
    </div>
  );
}

export default Players;
