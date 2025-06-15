import { defaultInputType } from "../../components/InputForm/OtherElements"

export default function getInputProps({
  id: inputId, type, data,
  limits, min, max,
  backend, onChange,
  disabled, required, setValueAs,
}, label = '') {

  const id = inputId || label.replace(/\W/g,'')
  const valueAsNumber = type === 'number' || type === 'time'

  // Build register options
  const options = {
    id, valueAsNumber, onChange, required, setValueAs, backend,
    value: data?.[id],
    type: type || defaultInputType,
    disabled: typeof disabled === 'function' ? disabled(data) : disabled,
    pattern: valueAsNumber ? /^\d*$/ : undefined,
    ...getLimit('min', limits, valueAsNumber, min, data),
    ...getLimit('max', limits, valueAsNumber, max, data),
  }

  // Build FormData props
  if (typeof backend.register !== 'function') return baseProps(options)
  if (type !== 'time') return { ...baseProps(options), ...backend.register(options.id, options) }
  
  return {
    ...baseProps(options),
    hours:   backend.register(`${options.id}.hours`,   timeOptions('hours',   options)),
    minutes: backend.register(`${options.id}.minutes`, timeOptions('minutes', options)),
    seconds: backend.register(`${options.id}.seconds`, timeOptions('seconds', options)),
  }
}


// --- Helpers --- \\

const baseProps = ({ id, type, disabled, required }) => ({ id, type, disabled, required })

const timeOptions = (place, { value, setValueAs, onChange, limits, valueAsNumber, ...props }) => ({
  ...props,
  ...getLimit('min', limits?.[place], valueAsNumber),
  ...getLimit('max', limits?.[place], valueAsNumber),
  value: value?.[place],
  type: 'number',
  setValueAs: setValueAs && ((val) => setValueAs(val, place)),
  onChange: onChange && ((ev) => onChange({ ...ev, place })),
})

const getLimit = (key, limits, isNumber = false, override = null, data = null) => {
  const value = typeof override === 'function' ? override(data) : override
  if (typeof value === 'number') return { [isNumber ? key : `${key}Length`]: value }
  if (typeof limits?.[key] !== 'number') return {}
  return { [isNumber ? key : `${key}Length`]: limits[key] }
}
