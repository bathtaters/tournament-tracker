import React, { useRef } from "react";

import { ListStyle, EntryStyle } from "../../styles/SuggestTextStyles";
import { useScrollToRef } from "../../services/basic.services";
import { getId } from "../../services/SuggestText/suggestText.utils"
import { useSetOnHover } from "../../services/SuggestText/suggestText.services"



function SuggestList({ suggestions, className, selected, pick, setSelected, textbox }) {
  // Scroll hidden item into view
  const listRef = useRef(null);
  const entryRef = useScrollToRef({ rootRef: listRef, threshold: 0.75, block: 'nearest' });

  // Handlers
  const handleHover = useSetOnHover(setSelected);
  const handleClick = (val) => () => pick(val);

  // Catch no list
  if (!Array.isArray(suggestions)) return null;

  // Render list
  return <ListStyle ref={listRef} textbox={textbox}>{
    suggestions.map((entry, idx) => (
      <EntryStyle className={`${className} ${entry.className || ''}`} isSelected={selected === idx} key={getId(entry)}>

        <div onMouseDown={handleClick(entry)} onMouseEnter={handleHover(idx)} ref={selected === idx ? entryRef : null}>
          
          {entry.value}

        </div>
      </EntryStyle>
    ))
  }</ListStyle>;
}

export default SuggestList;