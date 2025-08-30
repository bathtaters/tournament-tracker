import InputForm from "common/InputForm/InputForm";
import { ModalTitleStyle } from "../styles/PlayerStyles";
import useCreatePlayer from "../services/addPlayer.services";
import { buttons, layout } from "../addPlayer.layout";

type AddPlayerProps = {
  closeModal: () => void;
  lockModal: () => void;
};

export default function AddPlayer({ closeModal, lockModal }: AddPlayerProps) {
  const createPlayer = useCreatePlayer(closeModal);

  if (!closeModal) throw Error("Add Player modal not loaded");

  return (
    <div>
      <ModalTitleStyle>Add Player</ModalTitleStyle>
      <InputForm
        rows={layout}
        submitLabel="Create"
        onSubmit={createPlayer}
        onEdit={lockModal}
        buttons={buttons(closeModal)}
      />
    </div>
  );
}
