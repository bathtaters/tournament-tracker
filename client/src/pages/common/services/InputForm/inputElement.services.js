import { elementDefaults } from "../../styles/InputFormStyles";

// Get styling data
const inputTypes = ['text', 'number', 'date']
export const getClasses = (props) => {
  // Assign defaults to missing classes
  let elementClasses = {}
  Object.keys(elementDefaults).forEach((key) => {
    elementClasses[key] = props[key] ?? elementDefaults[key];
  })
  
  // Add DaisyUI classes
  if (!props.type || inputTypes.includes(props.type)) elementClasses.inputClass += ' input input-bordered w-full'
  else elementClasses.inputClass += ` ${props.type}`

  return { 
    ...elementClasses,

    // Get label positioning (default: top)
    labelType: {
      first: !props.labelPosition || props.labelPosition === 'top' || props.labelPosition === 'left',
      nest: props.labelPosition === 'left' || props.labelPosition === 'right',
    }
  }
}


// Combined getter
export default function getProps({
  id, label, type, stored,
  defaultValue, disabled,
  limits, min, max,
  transform, register, onChange
}) {

  const elementId = getElementId(id, label);

  if (type === 'toggle') type = 'checkbox'

  const props = {
    id: elementId,
    type: !type ? "text" : type,
    disabled: getDisabled(disabled, stored)
  };

  if (type === 'number') Object.assign(props, getLimits(limits, min, max, stored))

  return Object.assign(
    props,
    getInitValue(defaultValue, id, type, stored, transform),
    getFormData(id || elementId, props, register, onChange),
  );
}


// Individual getters
const getElementId = (id, label) => (id || label || '').replace(/\W/g,'');

const getDisabled = (disabled, stored) => typeof disabled === 'function' ? disabled(...stored) : disabled;

const getFormData = (elementId, props, register, onChange) =>
  props.disabled || !register ? {} :
    register(elementId, {onChange, valueAsNumber: props.type === 'number'});

const getInitValue = (defaultValue, id, type, stored, transform) => {
  const initalValue = id && id in stored[0] ? stored[0][id] : defaultValue ?? '';
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

