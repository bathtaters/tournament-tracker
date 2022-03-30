import React from "react";
import { useDispatch } from "react-redux";
import PropTypes from 'prop-types';

import ResetButtons from "./ResetButtons";
import InputForm from "../../common/InputForm";
import RawData from "../../common/RawData";
import Loading from "../../common/Loading";

import { TitleStyle } from "../styles/SettingsStyles";
import settingsLayout from "../settings.layout";

import { useSettingsQuery, useUpdateSettingsMutation } from "../header.fetch";
import { updateController } from "../services/settings.services";



function Settings({ modal }) {
  // Global state
  const dispatch = useDispatch();
  const { data, isLoading, error } = useSettingsQuery();
  const [ updateSettings ] = useUpdateSettingsMutation();
  
  // Submit
  const submitSettings = formData => 
    updateController(formData, data, updateSettings, dispatch) || modal.current.close(true);

  // Catch loading/error
  if (isLoading || error || !data || !modal)
    return (<div><Loading loading={isLoading} error={error} tagName="h3" /></div>);

  // Render
  return (<div>
    <TitleStyle>Settings</TitleStyle>

    <InputForm
      rows={settingsLayout[data.showadvanced ? 'basic' : 'advanced']}
      data={data}
      onSubmit={submitSettings}
      onEdit={modal.current.lock}
      buttons={settingsLayout.buttons(modal.current.close)}
    />

    <RawData className="text-sm mt-4" data={data} />

    {data.showadvanced && <ResetButtons />}
  </div>);
}


Settings.propTypes = { modal: PropTypes.object };

export default Settings;