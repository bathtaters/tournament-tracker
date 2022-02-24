import React from "react";

import { EntryStyle } from "../../styles/SuggestTextStyles";
import { getId } from "../../services/SuggestText/suggestText.utils"

function SuggestList({ list, className, selected, pick, setSelected }) {
  // Catch no list
  if (!Array.isArray(list)) return null;

  // Handlers
  const handleHover = (idx) => () => setSelected(idx);
  const handleClick = (val) => () => pick(val);

  // Render list
  return list.map((entry, idx) => (
    <EntryStyle className={`${className} ${entry.className || ''}`} isSelected={selected === idx} key={getId(entry)}>

      <div onMouseDown={handleClick(entry)} onMouseEnter={handleHover(idx)}>

        {entry.value}

      </div>
    </EntryStyle>
  ));
}

export default SuggestList;