import { useRef } from "react"
import { ListStyle, EntryStyle } from "./SuggestTextStyles"
import { displayEntry, getId } from "../services/suggestText.custom"
import { useScrollToRef } from "../services/suggestText.utils"
import { useSetOnHover } from "../services/suggestText.services"


function SuggestList({ suggestions, classes, selected, pick, setSelected, textbox, label }) {
  // Scroll hidden item into view
  const listRef = useRef(null);
  const entryRef = useScrollToRef({ rootRef: listRef, threshold: 0.75, block: 'nearest' });

  // Handlers
  const handleHover = useSetOnHover(setSelected);
  const handleClick = (val) => (ev) => ev.button === 0 && pick(val);

  // Catch no list
  if (!Array.isArray(suggestions)) return null;

  // Render list
  return (
    <ListStyle divRef={listRef} textbox={textbox} className={classes?.wrapper} label={label}>
      { suggestions.map((entry, idx) => (
        <EntryStyle classes={classes} isSelected={selected === idx} key={getId(entry)} id={getId(entry)}>

          <div onMouseDown={handleClick(entry)} onMouseEnter={handleHover(idx)} ref={selected === idx ? entryRef : null}>
            
            {displayEntry(entry)}

          </div>
        </EntryStyle>
      ))}
    </ListStyle>
  );
}

export default SuggestList;