import React, { useCallback, useState } from "react";
import PropTypes from 'prop-types';
import { useForm } from "react-hook-form";

import FormRow from "./components/InputForm/FormRow";
import { ButtonContainer, ButtonElement } from "./styles/InputFormStyles";
import { changeController, transformFunction, transformObject }  from "./services/InputForm/inputForm.services";


function InputForm({
  // Layout data
  rows = ['custom'], buttons = [], children,
  // Backend data
  data = {}, baseData = {},
  // Styling
  className = "", submitLabel = "Save", rowFirst = false, isGrid,
  // Event handlers
  onSubmit, onEdit,
}) {

  // Local state
  const { register, handleSubmit } = useForm();
  const [ isChanged, setChanged  ] = useState(false);

  // Transform data based on rows
  const transformData = useCallback(transformFunction(transformObject(rows), data, baseData), [rows, baseData]);
  
  // First edit handler
  const handleChange = useCallback(changeController(isChanged, onEdit, setChanged), [isChanged, onEdit, setChanged]);

  // Submit handler
  const submitController = (data) => onSubmit ? onSubmit(transformData(data)) : transformData(data);

  // Render
  return (
    <form onSubmit={handleSubmit(submitController)}>

      <div className={className}>
        <FormRow
          row={rows}
          data={data || {}}
          baseData={baseData}
          isFragment={isGrid}
          register={register}
          onChange={handleChange}
          custom={children}
          depth={+rowFirst}
        />
      </div>

      <ButtonContainer>
        <ButtonElement label={submitLabel} isSubmit={true} />
        {buttons.map(ButtonElement)}
      </ButtonContainer>

    </form>
  );
}

// Validation
InputForm.propTypes = {
  rows: PropTypes.array,
  buttons: PropTypes.array,
  children: PropTypes.node,

  data: PropTypes.object,
  baseData: PropTypes.object,

  className: PropTypes.string,
  submitLabel: PropTypes.string,
  rowFirst: PropTypes.bool,
  isGrid: PropTypes.bool,

  onSubmit: PropTypes.func,
  onEdit: PropTypes.func,
};

export default InputForm;