import React from "react";
import InputElement  from "./InputElement";
import { RowWrapper, Spacer } from "./OtherElements";

import { getRowKey } from "../../services/InputForm/inputForm.services";

// Row Map
function FormRow({ row, data, baseData, isFragment, backend, onChange, custom, depth = 0, keySuff = ':0' }) {

  // React element (or no data) => itself
  if (!row || React.isValidElement(row)) return row || null;

  // Array => Row of elements (recursive)
  if (Array.isArray(row)) return (
    <RowWrapper isFragment={isFragment} depth={depth}>
      {row.map((r,i) => 
        <FormRow
          row={r} depth={depth+1}
          keySuff={keySuff+':'+i}
          key={getRowKey(r,i,keySuff)}
          {...{ data, baseData, isFragment, backend, onChange, custom }}
        />
      )}
    </RowWrapper>
  );
  
  // Custom => InputForm.children (should only appear once)
  if (row === 'custom') return custom ? (<RowWrapper isFragment={true}>{custom}</RowWrapper>) : null;
  
  // String => row.type = row (ie row.type = "spacer")
  if (typeof row === 'string') row = {type: row};
  
  // Spacer => Spacer element 
  if (row.type === 'spacer') return <Spacer className={row.className} />;
  
  // Else => Input element
  return (
    <InputElement
      data={data}
      baseData={baseData}
      backend={backend}
      limits={baseData?.limits?.[row.id]}
      onChange={onChange}
      {...row}
    />
  );
}

export default FormRow;