import type { Player } from "types/models";
import { getDefault } from "core/services/validation.services";
import { FormButton, FormLayout } from "pages/common/types/InputForm";

// Add Player window
export const layout: FormLayout<Player> = [
  {
    label: "Name",
    id: "name",
    type: "text",
    defaultValue: getDefault("player", "name"),
    setValueAs: (name: string) => name.trim(),
  },
];

export const buttons: (clickCancel: FormButton["onClick"]) => FormButton[] = (
  clickCancel,
) => [{ label: "Cancel", onClick: clickCancel }];
