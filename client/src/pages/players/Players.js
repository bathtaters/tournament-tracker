import React from "react";
import AddPlayer from "./components/AddPlayer";
import Stats from "../stats/Stats";
import Modal from "../common/Modal";

import { TitleStyle, StatsStyle, FooterStyle, statsClass } from "./styles/PlayerStyles";
import { AddButton, RemoveButton } from "./styles/ButtonStyles";

import usePlayersController from "./services/player.services";

function Players() {
  const { deleteMode, access, modal, handlePlayerClick, toggleDelete } = usePlayersController()

  return (
    <div>
      <TitleStyle>Players</TitleStyle>

      <StatsStyle>
        <Stats
          className={`${statsClass.base(deleteMode)}${access > 2 ? ' table-zebra' : ''}`}
          highlightClass={statsClass.hover(deleteMode)}
          onPlayerClick={handlePlayerClick}
          hideTeams={true}
          hideStats={access < 3}
          showCredits={true}
        />
      </StatsStyle>

      <FooterStyle>
        { access > 1 && <AddButton disabled={deleteMode} onClick={()=>modal.current.open()} /> }

        { access > 2 && <RemoveButton onClick={toggleDelete} canDelete={deleteMode} /> }

      </FooterStyle>

      <Modal ref={modal}> <AddPlayer modal={modal} /> </Modal>
    </div>
  )
}

export default Players
