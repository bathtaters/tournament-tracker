import type { Player } from "types/models";
import type { EditableListProps } from "common/EditableList/EditableList";
import { playerExists, randomArray } from "./listEditor.utils";
import {
  useCreatePlayerMutation,
  usePlayerQuery,
  useSettingsQuery,
} from "../eventEditor.fetch";
import {
  useLockScreen,
  useOpenAlert,
} from "../../../common/General/common.hooks";
import { createLockCaption } from "../../../assets/constants";
import {
  createItemAlert,
  duplicateItemAlert,
  itemCreateError,
} from "../../../assets/alerts";

export default function usePlayerEditorController(
  type: EditableListProps<Player>["type"],
  onChange: EditableListProps<Player>["onChange"],
  fillAll: boolean,
  ignoreList?: Player["id"][],
) {
  // Load DB
  const { data: settings } = useSettingsQuery();
  const query = usePlayerQuery(null);
  const [createPlayerMutation, { isLoading: isAddingPlayer }] =
    useCreatePlayerMutation();

  // Init globals
  const openAlert = useOpenAlert();
  useLockScreen(isAddingPlayer, createLockCaption(type));

  // Add new player to DB
  const createPlayer = async (name: Player["name"]) => {
    // Check for errors
    if (!name.trim()) return;
    if (playerExists(name, query.data))
      return openAlert(duplicateItemAlert(type, name));

    // Confirm create
    const answer = await openAlert(createItemAlert(type, name), 0);
    if (!answer) return;

    // Create & Push player
    const playerData = { name };
    const result = await createPlayerMutation(playerData);
    if (result?.error || !result?.data?.id)
      throw itemCreateError(type, result, playerData);
    return result.data as Player;
  };

  const filter = ignoreList
    ? ({ id, hide }: Player) => !hide && !ignoreList.includes(id)
    : ({ hide }: Player) => !hide;

  const activePlayers =
    query.data && Object.keys(query.data).filter((id) => !query.data[id].hide);

  return {
    query,
    filter,

    autofill: ignoreList
      ? undefined
      : {
          label: fillAll
            ? `Fill ${query.data ? activePlayers.length : "All"}`
            : `Random ${settings?.autofillsize || ""}`,

          onClick: fillAll
            ? () => {
                onChange(activePlayers);
              }
            : settings?.autofillsize &&
              (() => {
                onChange(randomArray(activePlayers, settings?.autofillsize));
              }),
        },

    create: {
      label: "Add player...",
      mutation: createPlayer,
      hideOnEmpty: true,
    },
  };
}
