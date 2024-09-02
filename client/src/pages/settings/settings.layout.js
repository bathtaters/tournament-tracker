import { defaultSettings } from "../common/services/fetch.services";

// Settings layout object for InputForm
export const layout = [
  {
    label: 'Title', id: 'title', type: 'text', defaultValue: '', required: true,
    className: "w-full m-2",
    inputClass: "input-lg w-full",
    setValueAs: (title) => title.trim() || defaultSettings.title,
  },

  [
    { label: 'Start Date', id: 'datestart', type: 'date', required: true, },
    { label: 'End Date', id: 'dateend', type: 'date', required: true, }
  ],

  [
    { label: 'Daily Slots', id: 'dayslots', type: 'number', required: true, },
    { label: 'Auto-fill Size', id: 'autofillsize', type: 'number' },
  ],

  [
    { label: 'Enable Credits', id: 'showcredits', type: 'toggle' },
    { label: 'Auto-Report Byes', id: 'autobyes', type: 'toggle' },
    { label: 'Show Full Standings', id: 'showstandings', type: 'toggle' },
  ],
  [
    { label: 'Show Plan Menu', id: 'planmenu', type: 'toggle' },
    { label: 'Show Plan Events', id: 'planschedule', type: 'toggle' },
    { label: 'Show Raw Data', id: 'showrawjson', type: 'toggle', inputClass: 'toggle-accent' },
  ],
];

// Buttons prop for InputForm
export const buttons = (clickCancel) => [{ label: "Cancel", onClick: clickCancel }];