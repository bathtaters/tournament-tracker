import ResetButtons from "./components/ResetButtons";
import InputForm from "../../common/InputForm/InputForm";
import RawData from "../../common/RawData/RawData";
import Loading from "../../common/Loading/Loading";

import { TitleStyle } from "./styles/SettingsStyles";
import { buttons, layout } from "./settings.layout";
import useSettingsController from "./services/settings.controller";
import { useAccessLevel } from "../../common/General/common.fetch";

import { getBaseData } from "../../core/services/validation.services";

const baseData = getBaseData("settings");

type SettingsProps = {
  lock: () => void;
  close: () => void;
};

export default function Settings({ lock, close }: SettingsProps) {
  const { data, onSubmit, onChange, showLoading, error } =
    useSettingsController(close);
  const { access } = useAccessLevel();

  // Catch loading/error
  if (showLoading)
    return (
      <div>
        <Loading loading={!error} error={error} tagName="h3" />
      </div>
    );

  // Render
  return (
    <div>
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
    </div>
  );
}
