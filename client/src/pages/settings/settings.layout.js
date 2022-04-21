import { deepFilter } from "./services/settings.services";
import valid from "../../assets/validation.json";
const defaultTitle = valid.defaults.settings.title;

// Settings layout object for InputForm
const basicLayout = [
  { label: 'Title', id: 'title', type: 'text', defaultValue: '',
    className: "w-full m-2",
    inputClass: "input-lg w-full",
    transform: (title,data) => title.trim() ? title.trim() : (data && data.title) || defaultTitle
  },

  [
    { label: 'Start Date', id: 'datestart', type: 'date' },
    { label: 'End Date', id: 'dateend', type: 'date' }
  ],

  [
    { label: 'Daily Slots', id: 'dayslots', type: 'number' },
    { label: 'Auto-fill Size', id: 'autofillsize', type: 'number', advanced: true },
  ],

  [
    [
      { label: 'Show Advanced', id: 'showadvanced', type: 'toggle', inputClass: 'toggle-accent' },
      { label: 'Show Raw Data', id: 'showrawjson', type: 'toggle', inputClass: 'toggle-accent', advanced: true },
    ],[
      { label: 'Auto-Report Byes', id: 'autobyes', type: 'toggle', advanced: true },
      { label: 'Incomplete Events in Player Stats', id: 'includeincomplete', type: 'toggle', advanced: true },
    ],
  ]
];

// Buttons prop for InputForm
const buttons = (clickCancel) => [{ label: "Cancel", onClick: clickCancel }];

const settingsLayout = { 
  basic: basicLayout,
  advanced: deepFilter(basicLayout, s => !s.advanced),
  buttons,
};

export default settingsLayout;