import { deepFilter } from "./services/settings.services";
const defaultTitle = import("../../assets/validation.json").then(v => v.defaults.settings.title);

// Settings layout object for InputForm
const basicLayout = [
  { label: 'Title', id: 'title', type: 'text', defaultValue: '',
    className: "text-base sm:text-xl font-medium m-2 flex w-full items-baseline",
    inputClass: "max-color pt-1 px-2 w-full",
    transform: (title,data) => title.trim() ? title.trim() : (data && data.title) || defaultTitle
  },

  [
    { label: 'Start Date', id: 'datestart', type: 'date' },
    { label: 'End Date', id: 'dateend', type: 'date' }
  ],

  [
    { label: 'Auto-fill Size', id: 'autofillsize', type: 'number', advanced: true },
    { label: 'Daily Slots', id: 'dayslots', type: 'number' },
  ],

  [
    [
      { label: 'Show Advanced', id: 'showadvanced', type: 'checkbox' },
      { label: 'Show Raw Data', id: 'showrawjson', type: 'checkbox', advanced: true },
    ],[
      { label: 'Auto-Report Byes', id: 'autobyes', type: 'checkbox', advanced: true },
      { label: 'Incomplete Events in Player Stats', id: 'includeincomplete', type: 'checkbox', advanced: true },
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