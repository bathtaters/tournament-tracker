import type {
  BaseData,
  FormInput,
  FormLayout,
  HandleChange,
  Setters,
} from "../InputForm.d";
import { isValidElement, type ReactNode } from "react";
import InputElement from "./InputElement";
import { GroupWrapper, Spacer } from "../InputFormStyles";
import { getRowKey } from "../services/inputForm.services";

type FormRowProps<Data extends Record<string, any>> = {
  row: FormLayout<Data>;
  data: Data;
  setters: Setters<Data>;
  limits?: BaseData<Data>["limits"];
  isFragment?: boolean;
  handleChange?: HandleChange<Data>;
  custom?: ReactNode;
  isRow?: boolean;
  keySuffix?: string;
};

export default function FormRow<Data extends Record<string, any>>({
  row,
  data,
  setters,
  limits,
  isFragment = false,
  handleChange,
  custom,
  isRow = false,
  keySuffix = ":0",
}: FormRowProps<Data>): ReactNode {
  // React element (or no data) => itself
  if (!row) return null;
  if (isValidElement(row)) return row;

  // Array => Row of elements (recursive)
  if (Array.isArray(row))
    return (
      <GroupWrapper isFragment={isFragment} isRow={isRow}>
        {row.map((r, i) => (
          <FormRow
            key={getRowKey(r, i, keySuffix)}
            row={r}
            data={data}
            setters={setters}
            limits={limits}
            isFragment={isFragment}
            handleChange={handleChange}
            custom={custom}
            isRow={!isRow}
            keySuffix={keySuffix + ":" + i}
          />
        ))}
      </GroupWrapper>
    );

  // Custom => InputForm.children
  const type = typeof row === "string" ? row : row.type;
  if (type === "custom")
    return custom ? (
      <GroupWrapper isFragment={true}>{custom}</GroupWrapper>
    ) : null;

  // Spacer => Spacer element
  if (type === "spacer")
    return <Spacer className={(row as FormInput<Data>).className} />;

  // Else => Input element
  return typeof row !== "object" ? null : (
    <InputElement
      data={data}
      handleChange={handleChange}
      limits={limits?.[row.id]}
      setter={setters[row.id]}
      isFragment={isFragment}
      {...row}
    />
  );
}
