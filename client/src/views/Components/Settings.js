import React from "react";
import PropTypes from 'prop-types';

import InputForm from "./InputForm";

import { useSettingsQuery, useUpdateSettingsMutation, useResetDbMutation } from "../../models/baseApi";

import {
  defaultTournamentTitle,
  formatQueryError,
} from "../../assets/strings";


const settingsRows = [
  { label: 'Title', id: 'title', type: 'text', defaultValue: '',
    className: "text-base sm:text-xl font-medium m-2",
    transform: (title,data) => title.trim() ? title.trim() : (data && data.title) || defaultTournamentTitle
  },
  [{ label: 'Start Date', id: 'datestart', type: 'date' },
  { label: 'End Date', id: 'dateend', type: 'date' }],
  { label: 'Show Advanced', id: 'showadvanced', type: 'checkbox' },
  { label: 'Show Raw Data', id: 'showrawjson', type: 'checkbox' },
];


function Settings({ hideModal, lockModal }) {
  // Global state
  const { data, isLoading, error } = useSettingsQuery();
  
  // Global actions
  const [ resetDb ] = useResetDbMutation();
  const [ updateSettings ] = useUpdateSettingsMutation();
  const submitSettings = formData => {
    updateSettings(formData);
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
        rows={settingsRows}
        data={data}
        onSubmit={submitSettings}
        onEdit={lockModal}
        buttons={[{ label: "Cancel", onClick: hideModal }]}
      />
      {data.showrawjson ? <p className="font-thin text-sm dim-color mt-4">{JSON.stringify(data)}</p> : null}
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