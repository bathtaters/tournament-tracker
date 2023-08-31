import { deepFilter } from "./services/settings.services";
import { defaultSettings } from "../common/services/fetch.services";

// Settings layout object for InputForm
const basicLayout = [
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
    { label: 'Auto-fill Size', id: 'autofillsize', type: 'number', advanced: true },
  ],

  [
    { label: 'Show Raw Data', id: 'showrawjson', type: 'toggle', inputClass: 'toggle-accent', advanced: true },
    { label: 'Auto-Report Byes', id: 'autobyes', type: 'toggle', advanced: true },
  ]
];

// Buttons prop for InputForm
const buttons = (clickCancel) => [{ label: "Cancel", onClick: clickCancel }];

const settingsLayout = { 
  basic: deepFilter(basicLayout, s => !s.advanced),
  advanced: basicLayout,
  buttons,
};

export default settingsLayout;