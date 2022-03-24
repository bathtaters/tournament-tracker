import React from "react";
import AddPlayer from "./components/AddPlayer";
import Stats from "../stats/Stats";
import Modal from "../common/Modal";

import { TitleStyle, StatsStyle, FooterStyle, statsClass } from "./styles/PlayerStyles";
import { AddButton, RemoveButton } from "./styles/ButtonStyles";

import usePlayersController from "./services/player.services";

function Players() {
  const { deleteMode, advanceMode, modal, handlePlayerClick, toggleDelete } = usePlayersController()

  return (
    <div>
      <TitleStyle>Player Stats</TitleStyle>

      <StatsStyle>
        <Stats
          className={statsClass.base(deleteMode)}
          highlightClass={statsClass.hover(deleteMode)}
          onPlayerClick={handlePlayerClick}
          hideTeams={true}
        />
      </StatsStyle>

      <FooterStyle>
        <AddButton disabled={deleteMode} onClick={()=>modal.current.open()} />

        { advanceMode && <RemoveButton onClick={toggleDelete} canDelete={deleteMode} /> }

      </FooterStyle>

      <Modal ref={modal}> <AddPlayer modal={modal} /> </Modal>
    </div>
  )
}

export default Players
