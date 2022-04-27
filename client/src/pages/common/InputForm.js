import React from "react";
import PropTypes from 'prop-types';

import FormRow from "./components/InputForm/FormRow";
import FormError from "./components/InputForm/FormError";
import { FormContainer, ButtonContainer, ButtonElement } from "./styles/InputFormStyles";
import useFormController  from "./services/InputForm/inputForm.controller";


function InputForm({
  // Layout data
  rows = ['custom'], buttons = [], children,
  // Backend data
  data = {}, baseData = {},
  // Styling
  className = "flex justify-center", submitLabel = "Save", rowFirst = false, isGrid,
  // Event handlers
  onSubmit, onEdit, onChange
}) {

  const { handleSubmit, handleChange, backend } = useFormController({ rows, data, baseData, onSubmit, onEdit, onChange })

  // Render
  return (
    <FormContainer onSubmit={handleSubmit}>

      <FormError errors={backend.errors} rows={rows} limits={baseData?.limits} />

      <div className={className}>
        <FormRow
          row={rows}
          data={data || {}}
          baseData={baseData}
          isFragment={isGrid}
          backend={backend}
          onChange={handleChange}
          custom={children}
          depth={+rowFirst}
        />
      </div>

      <ButtonContainer>
        <ButtonElement label={submitLabel} isSubmit={true} />
        {buttons.map(ButtonElement)}
      </ButtonContainer>

    </FormContainer>
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