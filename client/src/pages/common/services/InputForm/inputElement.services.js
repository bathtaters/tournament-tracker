import { elementDefaults } from "../../styles/InputFormStyles";

// Get user classes ?? default classes
export const getClasses = (props) => Object.keys(elementDefaults).reduce((classes, key) => {
  classes[key] = props[key] ?? elementDefaults[key];
  return classes;
}, {});


// Combined getter
export default function getProps({
  id, label, type, stored,
  defaultValue, disabled,
  limits, min, max,
  transform, register, onChange
}) {

  const elementId = getElementId(id, label);

  const props = {
    id: elementId,
    type: !type ? "text" : type,
    disabled: getDisabled(disabled, stored)
  };

  if (type === 'number') Object.assign(props, getLimits(limits, min, max, stored))

  return Object.assign(
    props,
    getInitValue(defaultValue, id, type, stored, transform),
    getFormData(elementId, type, register, onChange),
  );
}


// Individual getters
const getElementId = (id, label) => (id || label || '').replace(/\W/g,'');

const getDisabled = (disabled, stored) => typeof disabled === 'function' ? disabled(...stored) : disabled;

const getFormData = (elementId, type, register, onChange) => 
  register ? register(elementId, {onChange, valueAsNumber: type === 'number'}) : {};

const getInitValue = (defaultValue, id, type, stored, transform) => {
  const initalValue = id && id in stored[0] ? stored[0][id] : defaultValue || '';
  return {
    [type === 'checkbox' ? "defaultChecked" : "defaultValue"]:
    transform ? transform(initalValue, ...stored) : initalValue
  };
}

function getLimits(limits, min, max, stored) {
  let elemLimits = {};

  // Min
  if (typeof min === 'function') elemLimits.min = min(...stored);
  else if (typeof min === 'number') elemLimits.min = min;
  else if (limits && 'min' in limits) elemLimits.min = limits.min;
  
  // Max
  if (typeof max === 'function') elemLimits.max = max(...stored);
  else if (typeof max === 'number') elemLimits.max = max;
  else if (limits && 'max' in limits) elemLimits.max = limits.max;

  return elemLimits;
}

