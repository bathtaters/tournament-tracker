import { defaultInputType } from "../../components/InputForm/OtherElements"

export default function getInputProps({
  id: inputId, type, data,
  limits, min, max,
  onChange,
  disabled, required,
}, label = '') {

  const id = inputId || label.replace(/\W/g,'')
  const valueAsNumber = type === 'number' || type === 'time'

  // Build register options
  const options = {
    id, valueAsNumber, onChange, required,
    value: data?.[id],
    type: type || defaultInputType,
    disabled: typeof disabled === 'function' ? disabled(data) : disabled,
    pattern: valueAsNumber ? /^\d*$/ : undefined,
    ...getLimit('min', limits, valueAsNumber, min, data),
    ...getLimit('max', limits, valueAsNumber, max, data),
  }

  // Build FormData props
  if (type !== 'time') return baseProps(options)
  
  return {
    ...baseProps(options),
    hours:   timeOptions('hours',   options),
    minutes: timeOptions('minutes', options),
    seconds: timeOptions('seconds', options),
  }
}


// --- Helpers --- \\

const baseProps = ({ id, type, value, disabled, required, onChange, min, max, minLength, maxLength }) => type === "checkbox" ? {
  id, type, disabled, required,
  name: id, checked: value,
  onChange: (ev) => onChange(id, ev),
} : {
  id, type, value, disabled, required,
  min, max, minLength, maxLength,
  name: id,
  onChange: (ev) => onChange(id, ev),
}

const timeOptions = (place, { id, value, onChange, limits, valueAsNumber, ...props }) => ({
  ...props,
  ...getLimit('min', limits?.[place], valueAsNumber),
  ...getLimit('max', limits?.[place], valueAsNumber),
  id: `${id}.${place}`,
  value: value?.[place],
  type: 'number',
  onChange: (ev) => onChange(id, (time) => ({ ...time, [place]: ev.target.value })),
})

const getLimit = (key, limits, isNumber = false, override = null, data = null) => {
  const value = typeof override === 'function' ? override(data) : override
  if (typeof value === 'number') return { [isNumber ? key : `${key}Length`]: value }
  if (typeof limits?.[key] !== 'number') return {}
  return { [isNumber ? key : `${key}Length`]: limits[key] }
}
