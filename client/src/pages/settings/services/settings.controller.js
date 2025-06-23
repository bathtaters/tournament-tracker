import { useDispatch } from "react-redux";
import { useSettingsQuery, useUpdateSettingsMutation } from "../settings.fetch"
import { useUpdateLocals, getNewSettings } from "./settings.services";

import { settings } from "../../../assets/config"


export default function useSettingsController(close) {
  // Setup hooks
  const dispatch = useDispatch();
  const { data, isLoading, error } = useSettingsQuery();
  const [ updateSettings ] = useUpdateSettingsMutation();

  // Setup live updates
  const onChange = useUpdateLocals(settings.storeLocal, dispatch)

  if (isLoading || error || !data || !close) return { showLoading: true, error }

  // Setup submit function
  const onSubmit = (newData) => {
    const newSettings = getNewSettings(newData, data)
    if (newSettings) updateSettings(newSettings)
    close(true)
  }

  return { data, onSubmit, onChange }
}