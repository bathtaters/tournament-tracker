import type { ReactNode } from "react";
import type { FormButton } from "./InputForm.d";
import FormRow from "./components/FormRow";
import {
  ButtonContainer,
  ButtonElement,
  FormContainer,
} from "./InputFormStyles";
import useFormController, {
  UseFormProps,
} from "./services/inputForm.controller";

/**
 * Controller for InputForm component.
 * @param [rows] - Layout object (Nested layouts alternate between columns/rows)
 * @param [buttons] - Button layout (Submit is included by default)
 * @param [children] - Element to substitute for "custom" in 'rows'
 * @param [data] - Current values of data
 * @param [baseData] - Type definitions (from Validation.json, defaults/limits/etc)
 * @param [isLoaded] - Reset form whenever this changes
 * @param [className] - CSS class for form wrapper
 * @param [submitLabel] - Text on submit button (Default: Save)
 * @param [rowFirst] - If true, top level of layout is in rows instead of columns
 * @param [isGrid] - If true, layout form to work in a CSS "grid"
 * @param onSubmit - `({ ...formData }) => void` - Function run when form is submitted
 * @param [onEdit] - `() => void` - Function run the first time a form is edited
 * @param [onChange] - `({ ...changedData }) => void` - Function run every time any value in the form changes
 */
type InputFormProps<T extends Record<string, any>> = UseFormProps<T> & {
  buttons?: FormButton[];
  children?: ReactNode;
  className?: string;
  submitLabel?: string;
  rowFirst?: boolean;
  isGrid?: boolean;
};

export default function InputForm<Data extends Record<string, any>>({
  // Layout data
  rows = ["custom"],
  buttons = [],
  children,
  // Backend data
  data,
  baseData,
  isLoaded = true,
  // Styling
  className = "flex justify-center grow",
  submitLabel = "Save",
  rowFirst = false,
  isGrid = false,
  // Event handlers
  onSubmit,
  onEdit,
  onChange,
}: InputFormProps<Data>) {
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
          limits={baseData?.limits}
          isFragment={isGrid}
          handleChange={handleChange}
          custom={children}
          isRow={rowFirst}
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
