import { useNavigate } from 'react-router-dom'
import { useOpenAlert } from "../../common/common.hooks"
import { useResetDbMutation } from "../header.fetch"

import { settings } from "../../../assets/config"
import { getLocalSettings, setLocalVar } from "../../common/services/fetch.services"
import { resetDbAlert, resetDbAlertConfirm } from "../../../assets/alerts"

// Handle clicking ResetDB buttons
export function useResetHandler(onReset) {
  const navigate = useNavigate()
  const openAlert = useOpenAlert()
  const [ resetDb, { isLoading } ] = useResetDbMutation()
  return [
    (fullReset) => openAlert(resetDbAlert, 0).then(r => r && openAlert(resetDbAlertConfirm, 1))
      .then(r => {
        if (!r) return;
        localStorage.clear()
        resetDb(fullReset).then(() => {
          navigate('/')
          onReset && onReset()
        })
      }),
    isLoading
  ]
}

// Returns properties from 'base' that are changed in 'compare'
const getUnqiue = (base, compare = {}) => Object.keys(base).reduce((obj,key) => {
  if (base[key] !== compare[key]) obj[key] = base[key]
  return obj
}, {})

// Transform settingsObject and update
export const updateController = (newData, oldData, updater, dispatch) => {
  // Get server data
  let compareData = {}
  oldData.saved.forEach((key) => compareData[key] = oldData[key])

  // Get local data
  Object.assign(compareData, getLocalSettings())

  // Filter out unchanged data
  const newSettings = getUnqiue(newData, compareData);

  // Set local data
  settings.storeLocal.forEach((key) => {
    if (key in newSettings) setLocalVar(key, newSettings[key], dispatch);
    delete newSettings[key];
  });

  // Set server data
  if (!Object.keys(newSettings).length) return;
  updater(newSettings);
}

// Runs array.filter on nested arrays (Only calls predicate on non-array elements)
export const deepFilter = (array, predicate) => array.reduce((res,elem,idx) => {
  if (Array.isArray(elem)) res.push(deepFilter(elem, predicate))
  else if (predicate(elem,idx,array)) res.push(elem)
  return res
}, [])