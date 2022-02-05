import React from "react";
import PropTypes from 'prop-types';

import InputForm from "../../shared/InputForm";

import { useCreatePlayerMutation } from "../player.fetch";

import { defaultPlayerName } from "../../../assets/strings";

// Compenent settings
const settingsRows = [
  {
    label: 'Name', id: 'name', type: 'text',
    defaultValue: defaultPlayerName,
    transform: name => name.trim()
  },
];

// Component
function AddPlayer({ hideModal, lockModal }) {
  const [ createPlayer ] = useCreatePlayerMutation();

  const submitPlayer = playerData => {
    if (playerData.name) createPlayer(playerData);
    hideModal(true);
  };

  return (
    <div>
      <h3 className="font-light max-color text-center mb-4">Add Player</h3>
      <InputForm
        rows={settingsRows}
        submitLabel="Create"
        onSubmit={submitPlayer}
        onEdit={lockModal}
        buttons={[{ label: "Cancel", onClick: hideModal }]}
      />
    </div>
  );
}

AddPlayer.propTypes = {
  hideModal: PropTypes.func,
  lockModal: PropTypes.func,
};

export default AddPlayer;