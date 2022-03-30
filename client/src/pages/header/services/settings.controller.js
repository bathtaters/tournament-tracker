import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useSettingsQuery, useUpdateSettingsMutation } from "../header.fetch"
import { updateLocals, getNewSettings } from "./settings.services";

import { settings } from "../../../assets/config"


export default function useSettingsController(modal) {
  // Setup hooks
  const dispatch = useDispatch();
  const { data, isLoading, error } = useSettingsQuery();
  const [ updateSettings ] = useUpdateSettingsMutation();

  // Setup live updates
  const onChange = useCallback(updateLocals(settings.storeLocal, dispatch), [JSON.stringify(settings.storeLocal)])

  if (isLoading || error || !data || !modal) return { showLoading: true, error }

  // Setup submit function
  const onSubmit = (newData) => {
    const newSettings = getNewSettings(newData, data)
    if (newSettings) updateSettings(newSettings)
    modal.current.close(true)
  }

  return { data, onSubmit, onChange }
}