import React from "react";
import PropTypes from 'prop-types';

import InputForm from "../../common/InputForm";
import RawData from "../../common/RawData";

import { useSettingsQuery, useUpdateSettingsMutation, useResetDbMutation } from "../header.fetch";

import { deepFilter, getUnqiue } from "../services/settings.services";
import {
  defaultTournamentTitle,
  formatQueryError,
} from "../../../assets/strings";


const settingsRows = [
  { label: 'Title', id: 'title', type: 'text', defaultValue: '',
    className: "text-base sm:text-xl font-medium m-2 flex w-full items-baseline",
    inputClass: "max-color pt-1 px-2 w-full",
    transform: (title,data) => title.trim() ? title.trim() : (data && data.title) || defaultTournamentTitle
  },
  [
    { label: 'Start Date', id: 'datestart', type: 'date' },
    { label: 'End Date', id: 'dateend', type: 'date' }
  ],
  { label: 'Daily Slots', id: 'dayslots', type: 'number', advanced: true },
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


function Settings({ hideModal, lockModal }) {
  // Global state
  const { data, isLoading, error } = useSettingsQuery();
  
  // Global actions
  const [ resetDb ] = useResetDbMutation();
  const [ updateSettings ] = useUpdateSettingsMutation();
  const submitSettings = formData => {
    const newSettings = getUnqiue(formData,data);
    console.log('NewSettings',newSettings)
    if (newSettings && Object.keys(newSettings).length) updateSettings(newSettings);
    hideModal(true);
  };

  // Render
  if (isLoading)
    return (<div><h3 className="font-light max-color text-center">Loading...</h3></div>);
  
  else if (error || !data)
    return (<div>
      <h3 className="font-light max-color text-center">{formatQueryError(error || 'No data.')}</h3>
    </div>);

  return (
    <div>
      <h3 className="font-light max-color text-center mb-2">Settings</h3>
      <InputForm
        rows={data.showadvanced ? settingsRows : deepFilter(settingsRows, s => !s.advanced)}
        data={data}
        onSubmit={submitSettings}
        onEdit={lockModal}
        buttons={[{ label: "Cancel", onClick: hideModal }]}
      />
      <RawData className="text-sm mt-4" data={data} />
      {data.showadvanced ? (<div className="text-center mt-4">
        <input
          className="w-20 h-8 mx-1 sm:w-28 sm:h-11 sm:mx-4"
          type="button"
          value="Reset Data"
          onClick={()=>resetDb(false)}
        />
        <input
          className="w-20 h-8 mx-1 sm:w-28 sm:h-11 sm:mx-4"
          type="button"
          value="Full Reset"
          onClick={()=>resetDb(true)}
        />
      </div>) : null}
    </div>
  );
}

Settings.propTypes = {
  hideModal: PropTypes.func,
  lockModal: PropTypes.func,
};

export default Settings;