import React from "react";
import PropTypes from 'prop-types';

import InputForm from "../../common/InputForm";
import { ModalTitleStyle } from "../styles/PlayerStyles";
import addPlayerLayout from "../addPlayer.layout";

import { useCreatePlayerMutation } from "../player.fetch";
import { createPlayerController } from "../services/player.services";

function AddPlayer({ modal }) {
  const [ createPlayer ] = useCreatePlayerMutation();

  const submitPlayer = (playerData) => {
    createPlayerController(playerData, createPlayer) && modal.current.close(true);
  };

  if (!modal || !modal.current) throw Error('Add Player modal not loaded');

  return (
    <div>
      <ModalTitleStyle>Add Player</ModalTitleStyle>
      <InputForm
        rows={addPlayerLayout.basic}
        submitLabel="Create"
        onSubmit={submitPlayer}
        onEdit={modal.current.lock}
        buttons={addPlayerLayout.buttons(modal.current.close)}
      />
    </div>
  );
}

AddPlayer.propTypes = {
  hideModal: PropTypes.func,
  lockModal: PropTypes.func,
};

export default AddPlayer;