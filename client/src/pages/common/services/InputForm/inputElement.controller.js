import { defaultInputType } from "../../components/InputForm/OtherElements"
import { eventWithValue } from "../basic.services"

export default function getInputProps({
  id: inputId, type, data,
  limits, min, max,
  onChange, onBlur,
  disabled, required,
}, label = '') {

  const id = inputId || label.replace(/\W/g,'')
  const valueAsNumber = type === 'number' || type === 'time'

  // Build register options
  const options = {
    id, valueAsNumber, onChange, onBlur, required,
    value: data?.[id],
    type: type || defaultInputType,
    disabled: typeof disabled === 'function' ? disabled(data) : disabled,
    pattern: valueAsNumber ? /^\d*$/ : undefined,
    ...getLimit('min', limits, valueAsNumber, min, data),
    ...getLimit('max', limits, valueAsNumber, max, data),
  }

  // Build FormData props
  if (type !== 'time') return baseProps(options, data)
  
  return {
    ...baseProps(options, data),
    hours:   timeOptions('hours',   options),
    minutes: timeOptions('minutes', options),
    seconds: timeOptions('seconds', options),
  }
}


// --- Helpers --- \\

const baseProps = ({
  id, type, value, disabled, required,
  onChange, onBlur, min, max, minLength, maxLength
}, data) => type === "checkbox" ? {
  id, type, disabled, required,
  name: id, checked: value,
  onChange: (ev) => onChange(id, ev),
  onBlur: typeof onBlur !== 'function' ? undefined : (ev) => {
    const newEvent = eventWithValue(ev, onBlur(ev.target.checked, data), true)
    onChange(id, newEvent)
  },
} : {
  id, type, value, disabled, required,
  min, max, minLength, maxLength,
  name: id,
  onChange: (ev) => onChange(id, ev),
  onBlur: typeof onBlur !== 'function' ? undefined : (ev) => {
    const newEvent = eventWithValue(ev, onBlur(ev.target.value, data))
    onChange(id, newEvent)
  },
}

const timeOptions = (place, { id, value, onChange, limits, valueAsNumber, onBlur, ...props }) => ({
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
