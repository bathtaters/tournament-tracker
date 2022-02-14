import valid from "../../assets/validation.json";

// Add Player window
export default {
  basic: [
    {
      label: 'Name', id: 'name', type: 'text',
      defaultValue: valid.defaults.player.name,
      transform: name => name.trim()
    },
  ],
  buttons: (clickCancel) => [{ label: "Cancel", onClick: clickCancel }]
};