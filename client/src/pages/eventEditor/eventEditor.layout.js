import valid from "../../assets/validation.json";

// Settings Window Layout/Validation
const lockAt = (statusVal) => (data) => data?.status != null && data?.status >= statusVal;

// Layout object for InputForm
export const editorLayout = [ 'custom', [
  {
    label: 'Title', id: 'title', type: 'text',
    required: true,
    labelClass: "font-normal",
    inputClass: "input-md",
    setValueAs: (title) => title.trim() || valid.defaults.event.title,
  },{ 
    label: 'Total Rounds', id: 'roundcount',
    type: 'number', disabled: lockAt(3),
    min: data => data ? data.roundactive : valid.limits.event.roundcount.min
  },{
    label: 'Wins Needed', id: 'wincount',
    type: 'number', disabled: lockAt(2),
  },{
    label: 'Players per Game', id: 'playerspermatch',
    type: 'number', disabled: lockAt(2),
  },
]];

export const editorButtonLayout = (eventid, clickDelete, clickCancel) => (eventid ? [{
  label: "Delete", onClick: clickDelete,
  className: "font-normal btn-error mx-1 sm:mx-4"
}] : []).concat(
  { label: "Cancel", onClick: clickCancel }
);

export const suggestListLayout = (players, data) =>
  players.map(id => ({ id, value: data[id].name }))
    .concat({ value: "Add Player", isStatic: true, className: "italic text-normal" });