import valid from "../../assets/validation.json";

// Settings Window Layout/Validation
const statusLockDefault = 2; // Lock setting once game has started
const lockAt = (statusVal = statusLockDefault) => (_,base) => base.eventStatus != null && base.eventStatus >= statusVal;

// Layout object for InputForm
export const editorLayout = [ 'custom', [
  {
    label: 'Title', id: 'title', type: 'text',
    className: "text-base sm:text-xl font-medium m-2",
    transform: (title,data) => title.trim() ? title.trim() : (data && data.title) || valid.defaults.event.title
  },{ 
    label: 'Total Rounds', id: 'roundcount',
    type: 'number', disabled: lockAt(3),
    min: data => data ? data.roundactive : valid.limits.event.roundcount.min
  },{
    label: 'Wins Needed', id: 'wincount',
    type: 'number', disabled: lockAt(),
  },{
    label: 'Players per Game', id: 'playerspermatch',
    type: 'number', disabled: lockAt(),
  },
]];

export const editorButtonLayout = (eventid, clickDelete, clickCancel) => (eventid ? [{
  label: "Delete", onClick: clickDelete,
  className: "font-normal base-color-inv neg-bgd w-14 h-8 mx-1 sm:w-20 sm:h-11 sm:mx-4 opacity-80"
}] : []).concat(
  { label: "Cancel", onClick: clickCancel }
);

export const suggestListLayout = (players, data) =>
  players.map(id => ({ id, value: data[id].name }))
    .concat({ value: "Add Player", isStatic: true, className: "italic text-normal" });