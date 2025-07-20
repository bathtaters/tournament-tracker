import { useDispatch } from "react-redux";
import { useCallback } from "react";
import { useSettingsQuery, useUpdateSettingsMutation } from "../settings.fetch";
import { getNewSettings } from "./settings.services";
import { setLocalVar } from "../../common/services/fetch.services";
import { settings } from "../../../assets/config";

export default function useSettingsController(close) {
  // Setup hooks
  const dispatch = useDispatch();
  const { data, isLoading, error } = useSettingsQuery();
  const [updateSettings] = useUpdateSettingsMutation();

  // Setup live updates
  const onChange = useCallback(
    (newData) =>
      Object.keys(newData).forEach((key) => {
        if (settings.storeLocal.includes(key))
          setLocalVar(key, newData[key], dispatch);
      }),
    [dispatch]
  );

  // Setup submit function
  const onSubmit = useCallback(
    (newData) => {
      const newSettings = getNewSettings(newData, data);
      if (newSettings) updateSettings(newSettings);
      close(true);
    },
    [data, close, updateSettings]
  );

  if (isLoading || error || !data || !close)
    return { showLoading: true, error };
  return { data, onSubmit, onChange };
}
