import type { ListClassNames } from "../services/suggestText";
import { RefObject, useRef } from "react";
import { EntryStyle, ListStyle } from "./SuggestTextStyles";
import { displayEntry, getId } from "../services/suggestText.custom";
import { useScrollToRef } from "../services/suggestText.utils";
import { useSetOnHover } from "../services/suggestText.services";

export type SuggestListProps = {
  suggestions?: string[];
  classes?: ListClassNames;
  selected?: number;
  pick: (entry: string) => void;
  setSelected: (selected: string) => void;
  textbox: RefObject<HTMLInputElement>;
  label: string;
};

export default function SuggestList({
  suggestions,
  classes,
  selected,
  pick,
  setSelected,
  textbox,
  label,
}: SuggestListProps) {
  // Scroll hidden item into view
  const listRef = useRef(null);
  const entryRef = useScrollToRef({
    rootRef: listRef,
    threshold: 0.75,
    block: "nearest",
  });

  const handleHover = useSetOnHover(setSelected);

  // Catch no list
  if (!Array.isArray(suggestions)) return null;

  // Render list
  return (
    <ListStyle
      divRef={listRef}
      textbox={textbox}
      className={classes?.wrapper}
      label={label}
    >
      {suggestions.map((entry, idx) => (
        <EntryStyle
          classes={classes}
          isSelected={selected === idx}
          key={getId(entry)}
          id={getId(entry)}
        >
          <div
            onMouseDown={(ev) => ev.button === 0 && pick(entry)}
            onMouseEnter={handleHover(idx)}
            ref={selected === idx ? entryRef : null}
          >
            {displayEntry(entry)}
          </div>
        </EntryStyle>
      ))}
    </ListStyle>
  );
}
