import React from "react";
import InputElement from "./InputElement";
import { GroupWrapper, Spacer } from "./OtherElements";

import { getRowKey } from "../../services/InputForm/inputForm.services";

// Row Map
function FormRow({
  row,
  data,
  setters,
  baseData,
  isFragment,
  onChange,
  custom,
  isRow = false,
  keySuff = ":0",
}) {
  // React element (or no data) => itself
  if (!row || React.isValidElement(row)) return row || null;

  // Array => Row of elements (recursive)
  if (Array.isArray(row))
    return (
      <GroupWrapper isFragment={isFragment} isRow={isRow}>
        {row.map((r, i) => (
          <FormRow
            row={r}
            isRow={!isRow}
            keySuff={keySuff + ":" + i}
            key={getRowKey(r, i, keySuff)}
            {...{ data, setters, baseData, isFragment, onChange, custom }}
          />
        ))}
      </GroupWrapper>
    );

  // Custom => InputForm.children (should only appear once)
  if (row === "custom")
    return custom ? (
      <GroupWrapper isFragment={true}>{custom}</GroupWrapper>
    ) : null;

  // String => row.type = row (ie row.type = "spacer")
  if (typeof row === "string") row = { type: row };

  // Spacer => Spacer element
  if (row.type === "spacer") return <Spacer className={row.className} />;

  // Else => Input element
  return (
    <InputElement
      data={data}
      baseData={baseData}
      limits={baseData?.limits?.[row.id]}
      onChange={onChange}
      onBlur={setters[row.id]}
      {...row}
    />
  );
}

export default FormRow;
