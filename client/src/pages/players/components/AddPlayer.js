import PropTypes from 'prop-types';
import InputForm from "../../common/InputForm";
import { ModalTitleStyle } from "../styles/PlayerStyles";
import addPlayerLayout from "../addPlayer.layout";
import useCreatePlayer from "../services/addPlayer.services";

function AddPlayer({ closeModal, lockModal }) {
  const createPlayer = useCreatePlayer(closeModal)

  if (!closeModal) throw Error('Add Player modal not loaded')

  return (
    <div>
      <ModalTitleStyle>Add Player</ModalTitleStyle>
      <InputForm
        rows={addPlayerLayout.basic}
        submitLabel="Create"
        onSubmit={createPlayer}
        onEdit={lockModal}
        buttons={addPlayerLayout.buttons(closeModal)}
      />
    </div>
  )
}

AddPlayer.propTypes = { modal: PropTypes.object }
export default AddPlayer