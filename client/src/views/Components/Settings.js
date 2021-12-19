import React from "react";
import PropTypes from 'prop-types';
import { useForm } from "react-hook-form";

import { useSettingsQuery, useUpdateSettingsMutation, useResetDbMutation } from "../../models/baseApi";

import {
  defaultDraftTitle,
  formatQueryError,
} from "../../assets/strings";


const settingsRows = [
  { title: 'Title', key: 'title', type: 'title', defaultValue: '',
    calcVal: (title,data) => title.trim() ? title.trim() : (data && data.title) || defaultDraftTitle
  },
  { title: 'Start Date', key: 'dateStart', type: 'date' },
  { title: 'End Date', key: 'dateEnd', type: 'date' },
  { title: 'Show Advanced', key: 'showAdvanced', type: 'checkbox' },
  { title: 'Show Raw Data', key: 'showRawJson', type: 'checkbox' },
];


function Settings({ hideModal }) {
  // Global state
  const { data, isLoading, error } = useSettingsQuery();

  // Local state
  const { register, handleSubmit } = useForm();
  
  // Global actions
  const [ resetDb ] = useResetDbMutation();
  const [ updateSettings ] = useUpdateSettingsMutation();
  const submitDraft = formData => {
    // Build settings object
    settingsRows.forEach(row => {
      if (formData[row.key.toLowerCase()]) {
        if (row.type === 'number')
          formData[row.key.toLowerCase()] = +formData[row.key.toLowerCase()];
      }
      if (row.calcVal)
        formData[row.key.toLowerCase()] = row.calcVal(formData[row.key.toLowerCase()], data);
    });

    // Add to DB
    updateSettings(formData);
    if (hideModal) hideModal(true);
  };


  // Render
  if (isLoading)
    return (<div><h3 className="font-light max-color text-center">Loading...</h3></div>);
  
  else if (error || !data)
    return (<div>
      <h3 className="font-light max-color text-center">{formatQueryError(error || 'No data.')}</h3>
    </div>);

  const settingsToRow = (row, data = {}) => (
    <div key={row.key} className="m-4 text-left">
      <h4 className={row.type === 'title' ? "" : "text-sm sm:text-lg font-light"}>
        <label for={row.key} className="mr-2 w-max">{row.title}</label>
        <input
          id={row.key}
          className="max-color pt-1 px-2"
          type={!row.type || row.type === 'title' ? "text" : row.type}
          // min={row.calcMin ? row.calcMin(data) : row.min }
          // max={row.calcMax ? row.calcMax(data) : row.max }
          {...{[row.type === 'checkbox' ? "defaultChecked" : "defaultValue"]: 
            row.key.toLowerCase() in data ? (
              row.calcVal ? row.calcVal(data[row.key.toLowerCase()], data) : data[row.key.toLowerCase()]
            ) : row.calcVal ? row.calcVal(row.defaultValue, data) : row.defaultValue }}
          {...register(row.key.toLowerCase())}
        />
      </h4>
    </div>
  );

  return (
    <div>
      <h3 className="font-light max-color text-center mb-2">Settings</h3>
      <form onSubmit={handleSubmit(submitDraft)}>
        <div>
          {settingsRows.map(row => settingsToRow(row, data || {}))}
        </div>
        <div className="text-center mt-4">
          <input
            className="font-light dim-color w-14 h-8 mx-1 sm:w-20 sm:h-11 sm:mx-4"
            type="submit"
            value="Save"
          />
          <input
            className="font-light dim-color w-14 h-8 mx-1 sm:w-20 sm:h-11 sm:mx-4"
            type="button"
            value="Cancel"
            onClick={()=>hideModal(true)}
          />
        </div>
      </form>
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
};

export default Settings;