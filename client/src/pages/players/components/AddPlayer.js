import React from "react";
import PropTypes from 'prop-types';

import InputForm from "../../common/InputForm";
import { ModalTitleStyle } from "../styles/PlayerStyles";
import addPlayerLayout from "../addPlayer.layout";

import useCreatePlayer from "../services/addPlayer.services";

function AddPlayer({ modal }) {
  const createPlayer = useCreatePlayer(modal)

  if (!modal?.current) throw Error('Add Player modal not loaded')

  return (
    <div>
      <ModalTitleStyle>Add Player</ModalTitleStyle>
      <InputForm
        rows={addPlayerLayout.basic}
        submitLabel="Create"
        onSubmit={createPlayer}
        onEdit={modal.current.lock}
        buttons={addPlayerLayout.buttons(modal.current.close)}
      />
    </div>
  )
}

AddPlayer.propTypes = { modal: PropTypes.object }
export default AddPlayer