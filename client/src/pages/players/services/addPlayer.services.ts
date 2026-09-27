import { Player } from "types/models";
import { usePlayerQuery, useCreatePlayerMutation } from "../player.fetch";
import { useOpenAlert } from "../../../common/General/common.hooks";
import {
  duplicateNameAlert,
  emptyNameAlert,
  notLoadedAlert,
} from "../../../assets/alerts";

export default function useCreatePlayer(
  close: (overrideLock?: boolean) => void,
) {
  // Load in global data
  const { data, isLoading, error } = usePlayerQuery();
  const [createPlayerFetch] = useCreatePlayerMutation();
  const openAlert = useOpenAlert();

  // Create list of names (to check for duplicates)
  const playerNames = Object.values(data || {}).map(({ name }) =>
    (name || "").toLowerCase(),
  );

  // Create player action
  const createPlayer = (playerData?: Player) => {
    // Do nothing if empty
    if (!playerData?.name) return openAlert(emptyNameAlert);

    // Check if player name exists
    if (playerNames.includes(playerData.name.toLowerCase()))
      return openAlert(duplicateNameAlert(playerData.name));

    // Add player & close modal
    createPlayerFetch(playerData);
    close(true);
  };

  // Catch errors
  if (error) throw new Error(String(error));
  if (isLoading) return () => openAlert(notLoadedAlert);

  return createPlayer;
}
