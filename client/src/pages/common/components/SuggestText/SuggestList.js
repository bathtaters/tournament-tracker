import React from "react";

import { EntryStyle } from "../../styles/SuggestTextStyles";
import { getId, getVal } from "../../services/SuggestText/suggestText.utils"

function SuggestList({ list, className, selected, choose, setSelected, offset = 0 }) {
  if (!list) return null;

  const isSelected  = (idx) => selected === idx + offset;
  const handleHover = (idx) => () => setSelected(idx);
  const handleClick = (val) => () => choose(val);

  return list.map((entry, idx) => (
    <EntryStyle className={className} isSelected={isSelected(idx)} key={getId(entry, '_')}>

      <div onMouseDown={handleClick(entry)} onMouseEnter={handleHover(idx + offset)}>

        {getVal(entry)}

      </div>
    </EntryStyle>
  ));
}

export default SuggestList;