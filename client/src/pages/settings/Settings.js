import PropTypes from 'prop-types';

import ResetButtons from "./components/ResetButtons";
import InputForm from "../common/InputForm";
import RawData from "../common/RawData";
import Loading from "../common/Loading";

import { TitleStyle } from "./styles/SettingsStyles";
import { layout, buttons } from "./settings.layout";

import useSettingsController from "./services/settings.controller";

import { getBaseData } from "../../core/services/validation.services";
import { useAccessLevel } from "../common/common.fetch";
const baseData = getBaseData('settings');


function Settings({ lock, close }) {
  const { data, onSubmit, onChange, showLoading, error } = useSettingsController(close)
  const { access } = useAccessLevel()

  // Catch loading/error
  if (showLoading) return (<div><Loading loading={!error} error={error} tagName="h3" /></div>);

  // Render
  return (<div>
    <TitleStyle>Settings</TitleStyle>

    <InputForm
      rows={layout}
      data={data}
      baseData={baseData}
      onSubmit={onSubmit}
      onEdit={lock}
      onChange={onChange}
      buttons={buttons(close)}
    />

    <RawData className="text-sm mt-4" data={data} />

    <ResetButtons visible={access > 2} />
  </div>);
}


Settings.propTypes = { modal: PropTypes.object };

export default Settings;