import PropTypes from "prop-types";

import FormRow from "./components/InputForm/FormRow";
import {
  FormContainer,
  ButtonContainer,
  ButtonElement,
} from "./styles/InputFormStyles";
import useFormController from "./services/InputForm/inputForm.controller";

function InputForm({
  // Layout data
  rows = ["custom"],
  buttons = [],
  children,
  // Backend data
  data = {},
  baseData = {},
  isLoaded = true,
  // Styling
  className = "flex justify-center",
  submitLabel = "Save",
  rowFirst = false,
  isGrid,
  // Event handlers
  onSubmit,
  onEdit,
  onChange,
}) {
  const { values, setters, handleSubmit, handleChange } = useFormController({
    rows,
    data,
    baseData,
    onSubmit,
    onEdit,
    onChange,
    isLoaded,
  });

  // Render
  return (
    <FormContainer onSubmit={handleSubmit}>
      <div className={className}>
        <FormRow
          row={rows}
          data={values}
          setters={setters}
          baseData={baseData}
          isFragment={isGrid}
          onChange={handleChange}
          custom={children}
          depth={+rowFirst}
        />
      </div>

      <ButtonContainer>
        <ButtonElement label={submitLabel} isSubmit={true} />
        {buttons.map((btnProps, idx) => (
          <ButtonElement
            {...btnProps}
            key={btnProps.key ?? btnProps.label ?? idx}
          />
        ))}
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
  isLoaded: PropTypes.bool,

  className: PropTypes.string,
  submitLabel: PropTypes.string,
  rowFirst: PropTypes.bool,
  isGrid: PropTypes.bool,

  onSubmit: PropTypes.func,
  onEdit: PropTypes.func,
};

export default InputForm;
