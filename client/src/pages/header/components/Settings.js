import React from "react";
import PropTypes from 'prop-types';

import ResetButtons from "./ResetButtons";
import InputForm from "../../common/InputForm";
import RawData from "../../common/RawData";
import Loading from "../../common/Loading";

import { TitleStyle } from "../styles/SettingsStyles";
import settingsLayout from "../settings.layout";

import useSettingsController from "../services/settings.controller";


function Settings({ modal }) {
  const { data, onSubmit, onChange, showLoading, error } = useSettingsController(modal)

  // Catch loading/error
  if (showLoading) return (<div><Loading loading={!error} error={error} tagName="h3" /></div>);

  // Render
  return (<div>
    <TitleStyle>Settings</TitleStyle>

    <InputForm
      rows={settingsLayout[data.showadvanced ? 'basic' : 'advanced']}
      data={data}
      onSubmit={onSubmit}
      onEdit={modal.current.lock}
      onChange={onChange}
      buttons={settingsLayout.buttons(modal.current.close)}
    />

    <RawData className="text-sm mt-4" data={data} />

    {data.showadvanced && <ResetButtons />}
  </div>);
}


Settings.propTypes = { modal: PropTypes.object };

export default Settings;