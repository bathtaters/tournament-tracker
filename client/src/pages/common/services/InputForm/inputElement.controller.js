import { defaultInputType } from "./inputClass.controller";

// Individual getters
const getElementId = (id, label) => (id || label || '').replace(/\W/g,'');

const getType = (type) => type === 'toggle' ? 'checkbox' : type || defaultInputType;

const getDisabled = (disabled, data) => typeof disabled === 'function' ? disabled(data) : disabled;

function getLimits(limits, min, max, data, isNumber) {
  let elemLimits = {};
  const suffix = isNumber ? '' : 'Length'

  // Min
  if (typeof min === 'function') elemLimits['min'+suffix] = min(data);
  else if (typeof min === 'number') elemLimits['min'+suffix] = min;
  if (elemLimits['min'+suffix] == null && typeof limits?.min === 'number') elemLimits['min'+suffix] = limits.min;
  
  // Max
  if (typeof max === 'function') elemLimits['max'+suffix] = max(data);
  else if (typeof max === 'number') elemLimits['max'+suffix] = max;
  if (elemLimits['max'+suffix] == null && typeof limits?.max === 'number') elemLimits['max'+suffix] = limits.max;

  return elemLimits;
}

const getFormData = ({ id, type, value, limits, disabled, required, setValueAs }, register, onChange) => {
  if (!register) return {}

  if (type === 'time') return {
    hours: getTimeData("hours", id, value, limits, disabled, required, setValueAs, register, onChange),
    minutes: getTimeData("minutes", id, value, limits, disabled, required, setValueAs, register, onChange),
    seconds: getTimeData("seconds", id, value, limits, disabled, required, setValueAs, register, onChange),
  }

  const isNumber = type === 'number'
  return register(id, { 
    value, setValueAs,
    disabled, required, 
    onChange, ...limits,
    valueAsNumber: isNumber,
    pattern: isNumber ? /^\d*$/ : undefined,
  });
}

// For time type
const getTimeData = (place, id, value, limits, disabled, required, setValueAs, register, onChange) => getFormData(
  {
    id: `${id}.${place}`,
    type: "number",
    value: value?.[place],
    limits: limits?.[place],
    setValueAs: setValueAs && ((val) => setValueAs(val, place)),
    disabled, required,
  },
  register,
  onChange && ((ev) => onChange({ ...ev, place })),
)


// Combined getter
export default function getProps({
  id, label, type, data,
  disabled, required, setValueAs,
  limits, min, max,
  backend, onChange
}) {

  const props = {
    id: id || getElementId(id, label),
    type: getType(type),
    value: data?.[id],
    disabled: getDisabled(disabled, data),
    limits: getLimits(limits, min, max, data, type === 'number'),
    required, setValueAs,
  }

  return Object.assign(
    { id: props.id, type: props.type, disabled: props.disabled, required: props.required },
    getFormData(props, backend.register, onChange),
  )
}