import type { ReactNode } from "react";
import type { BaseData, FormButton, FormLayout } from "./types/InputForm";
import FormRow from "./components/InputForm/FormRow";
import {
  ButtonContainer,
  ButtonElement,
  FormContainer,
} from "./styles/InputFormStyles";
import useFormController from "./services/InputForm/inputForm.controller";

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
type InputFormProps<T extends Record<string, any>> = {
  rows?: FormLayout<T>;
  buttons?: FormButton[];
  children?: ReactNode;
  data?: T;
  baseData?: BaseData<T>;
  isLoaded?: boolean;
  className?: string;
  submitLabel?: string;
  rowFirst?: boolean;
  isGrid?: boolean;
  onSubmit: (data: T) => void;
  onEdit?: () => void;
  onChange?: (update: Partial<T>) => void;
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
  className = "flex justify-center",
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
          baseData={baseData}
          isFragment={isGrid}
          onChange={handleChange}
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
