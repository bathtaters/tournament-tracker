import { getDefault } from "../../core/services/validation.services";

// Add Player window
const addPlayerLayout = {
  basic: [
    {
      label: "Name",
      id: "name",
      type: "text",
      defaultValue: getDefault("player", "name"),
      transform: (name) => name.trim(),
    },
  ],
  buttons: (clickCancel) => [{ label: "Cancel", onClick: clickCancel }],
};

export default addPlayerLayout;
