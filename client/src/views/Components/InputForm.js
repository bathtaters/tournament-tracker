import React, { Fragment, useCallback, useState } from "react";
import PropTypes from 'prop-types';
import { useForm } from "react-hook-form";

// Static Classes
const baseClass = {
  button: "font-light base-color w-14 h-8 mx-1 sm:w-20 sm:h-11 sm:mx-4",
  element: "text-sm sm:text-lg font-light m-1",
  label: "mx-2 w-max",
  input: "max-color pt-1 px-2",
  row: isRow => "m-2 flex justify-start items-baseline flex-"+(isRow ? "row flex-wrap-reverse" : "col"),
  buttonContainer: "mt-4 w-full flex justify-center items-baseline flex-wrap",
}


// Form Base
function InputForm({
  rows = ['custom'],
  buttons = [],
  data = {},
  baseData = {},
  submitLabel = "Save",
  onSubmit,
  onEdit,
  children,
  className = "",
  isGrid = false,
  rowFirst = false,
}) {
  const { register, handleSubmit } = useForm();
  // eslint-disable-next-line
  const transformData = useCallback(
    transformFunction(transformObject(rows), data, baseData),
    [rows, baseData],
  );
  
  // Run when first edit occurs
  const [isChanged, setChanged] = useState(false);
  const handleChange = useCallback(() => { 
    if (!isChanged) { if (onEdit) onEdit(); setChanged(true); }
  }, [isChanged, setChanged, onEdit]);

  return (
    <form onSubmit={handleSubmit(data => onSubmit ? onSubmit(transformData(data)) : transformData(data))}>
      <div className={className}>
        {formRow(rows, data || {}, baseData, isGrid, register, handleChange, children, +rowFirst)}
      </div>
      <div className={baseClass.buttonContainer}>
        <input type="submit" value={submitLabel} className={baseClass.button} />
        {buttons.map(ButtonElement)}
      </div>
    </form>
  );
}

// Transform results
const transformObject = (rows, obj={}) => {
  if (Array.isArray(rows)) rows.forEach(r => transformObject(r,obj));
  else if (rows && rows.transform && rows.id) obj[rows.id] = rows.transform;
  return obj;
};
const transformFunction = (transformObj, oldData, baseData) => data => {
  Object.keys(transformObj).forEach(id => { data[id] = transformObj[id](data[id], oldData, baseData, data) });
  return data;
}


// Row Map
function formRow(row, data, baseData, isFragment, register, onChange, custom, depth = 0, idx = 0) {

  if (!row || React.isValidElement(row)) return row || null;

  else if (Array.isArray(row))
    return isFragment ? (
      <Fragment key={'Container'+depth+'.'+idx}>
        {row.map((r,idx) => formRow(r,data,baseData,isFragment,register,onChange,custom,depth+1,idx+1))}
      </Fragment>
    ) : (
      <div className={baseClass.row(depth % 2)} key={'Container'+depth}>
        {row.map(r => formRow(r,data,baseData,isFragment,register,onChange,custom,depth+1))}
      </div>
    );

  else if (row === 'custom') return custom ? (<Fragment key={'Custom'}>{custom}</Fragment>) : null;

  else if (typeof row === 'string') row = {type: row};
  
  if (row.type === 'spacer') return <div className={row.className} />;

  if (!('defaultValue' in row) && baseData.defaultValues && row.id && row.id in baseData.defaultValues)
    row.defaultValue = baseData.defaultValues[row.id];
  return <InputElement
    key={row.id || row.label}
    stored={[data,baseData]} register={register}
    limits={row.id && baseData && baseData.limits && baseData.limits[row.id]}
    onChange={onChange}
    {...row}
  />;
}


// Button Map
const ButtonElement = ({ label, onClick, className = baseClass.button }) =>
  <input type="button" value={label} className={className} onClick={onClick} key={label} />;


// Input Element constructor
export function InputElement({
  id,
  label = '',
  type = 'text',
  defaultValue = '',
  className = baseClass.element,
  labelClass = baseClass.label,
  inputClass = baseClass.input,
  labelIsRight = false,
  isFragment = false,
  disabled, min, max, 
  onChange, transform,
  stored, register, limits,
}) {
  const initalValue = id && id in stored[0] ? stored[0][id] : defaultValue;
  const settings = {
    [type === 'checkbox' ? "defaultChecked" : "defaultValue"]:
    transform ? transform(initalValue, ...stored) : initalValue
  };

  if (type === 'number') {
    if (typeof min === 'function') settings.min = min(...stored);
    else if (typeof min === 'number') settings.min = min;
    else if (limits && 'min' in limits) settings.min = limits.min;
    
    if (typeof max === 'function') settings.max = max(...stored);
    else if (typeof max === 'number') settings.max = max;
    else if (limits && 'max' in limits) settings.max = limits.max;
  }
  
  // Render
  const elementId = (id || label).replace(/\W/g,'');
  const labelElement = label ? <label className={labelClass} htmlFor={elementId}>{label}</label> : null;
  const inputElement = <input
    id={elementId}
    className={inputClass}
    type={!type ? "text" : type}
    disabled={typeof disabled === 'function' ? disabled(...stored) : disabled}
    {...settings}
    {...(register ? register(id || label, {onChange, valueAsNumber: type === 'number'}) : {})}
  />;

  if (isFragment)
    return (<Fragment>
      {!labelIsRight ? labelElement : null}
      {inputElement}
      {labelIsRight ? labelElement : null}
    </Fragment>);

  return (<div className={className}>
    {!labelIsRight ? labelElement : null}
    {inputElement}
    {labelIsRight ? labelElement : null}
  </div>);
}



export default InputForm;





// Validation

InputForm.propTypes = {
  rows: PropTypes.array,
  buttons: PropTypes.array,
  data: PropTypes.object,
  baseData: PropTypes.object,
  submitLabel: PropTypes.string,
  onSubmit: PropTypes.func,
  onEdit: PropTypes.func,
  children: PropTypes.node,
  className: PropTypes.string,
  rowFirst: PropTypes.bool,
  isGrid: PropTypes.bool,
};

InputElement.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  type: PropTypes.string.isRequired,
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
  labelClass: PropTypes.string,
  inputClass: PropTypes.string,
  labelIsRight: PropTypes.bool,
  isFragment: PropTypes.bool,
  disabled: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
  min: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
  max: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
  limits: PropTypes.object,
  onChange: PropTypes.func,
  transform: PropTypes.func,
  stored: PropTypes.arrayOf(PropTypes.object),
  register: PropTypes.func,
};

ButtonElement.propTypes = {
  label: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.string,
};