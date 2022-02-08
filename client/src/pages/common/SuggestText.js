import React, { useEffect, useState, useRef } from "react";
import PropTypes from 'prop-types';

// Constants (Note the spaces at the start/end)
const defStyle = "base-bgd dim-color py-0.5 px-2 w-full ";
const selectStyle = " base-bgd-inv base-color-inv";
const suggestionKey = 'name', uniqueKey = 'id';

// Suggestion logic
const getSuggestions = (list,value) => {
  const len = value.length;
  // if (!len) return [[],false]; // Hide all when text box is empty 
  const lower = value.toLowerCase();
  let exact = false;
  const matches = list.filter(entry => {
    const entryLower = entry[suggestionKey].toLowerCase();
    if (entryLower === lower) exact = entry;
    return entryLower.slice(0,len) === lower // Quicker
    // return entryLower.indexOf(lower) > -1 // More flexible
      && !exact;
  });
  return [matches, !matches.length && exact];
}

// Main component
function SuggestText({
  value,
  suggestionList = [],
  staticList = [],
  onChange,
  onEnter,
  onStaticSelect,
  className = "",
  suggestClass = "",
  staticClass = "dim-color italic",
  isHidden = false,
}) {
  // Setup
  const [suggestions, isSolo] = getSuggestions(suggestionList, value);
  // const suggestions = suggestionList.filter(partialMatch(value));
  const listCount = suggestions.length + staticList.length;
  const textbox = useRef(null);

  // Show/hide list
  const [listIsVisible, setListVisible] = useState(false);
  const showList = () => setListVisible(true);
  const hideList = () => setListVisible(false);
  
  // Dropdown selection
  const [selected, setSelected] = useState(-1);
  useEffect(() => {
    if ((selected < 0 || selected >= listCount) && suggestions.length === 1) setSelected(0);
    else if (selected >= listCount) setSelected(-1);
  }, [selected, listCount, suggestions]);
  const incSelect = () => setSelected(selected + 1 >= listCount || selected < 0 ? 0 : selected + 1);
  const decSelect = () => setSelected(selected <= 0 || selected > listCount ? listCount - 1 : selected - 1);
  const handleMouseOver = idx => () => setSelected(idx);
  const handleClick = clickedVal => e => choose(clickedVal);

  // Choose a player
  const getCurrent = () => selected < suggestions.length ? suggestions[selected] : staticList[selected - suggestions.length];
  const choose = select => {
    if (!select) select = getCurrent() || isSolo;
    if (typeof select === 'string' && onStaticSelect) {
      if (onStaticSelect(value, select)) return;
    } else onChange(
      {target: { value: select[suggestionKey] || select, id: select[uniqueKey] }}
    );
    setSelected(-1);
  }

  // Keyboard UI
  const keystrokeHandler = e => {
    // console.log('keystroke: ',e.keyCode);
    if ([27,13,40,38].includes(e.keyCode)) e.preventDefault();
    // Escape <27>
    if (e.keyCode === 27) selected === -1 ? textbox.current.blur() : setSelected(-1);
    // Enter <13>
    if (e.keyCode === 13) {
      if (isSolo && onEnter) { onEnter(e,isSolo); }
      else if (selected >= 0 && selected < listCount) choose();
    }
    // Down <40>
    if (e.keyCode === 40) incSelect();
    // Up <38>
    if (e.keyCode === 38) decSelect();
  };

  useEffect(() => {
    if (!isHidden) document.addEventListener('keydown', keystrokeHandler, false);
    return () => document.removeEventListener('keydown', keystrokeHandler, false);
  });

  return (
    <span className="inline-block relative p-1">
      <input
        className={className+(isHidden ? ' hidden' : '')}
        onBlur={hideList}
        onChange={onChange}
        onFocus={showList}
        ref={textbox}
        type="text"
        value={value}
      />
      
      { listIsVisible && !isSolo && listCount ? 
        <div className="absolute left-0 z-50 right-0 top-auto max-h-screen bg-red-500">
          <div className="fixed border dim-border shadow-lg overflow-auto max-h-24 w-full">
            <ul>
              { suggestions.map((suggest, idx) => (
                <li
                  className={defStyle + suggestClass + (selected === idx ? selectStyle : '')}
                  key={suggest[uniqueKey]}
                  onMouseDown={handleClick(suggest)}
                  onMouseEnter={handleMouseOver(idx)}
                >
                  {suggest[suggestionKey]}
                </li>
              )) }

              { value && staticList ? staticList.map((staticOption, sidx) => 
                <li
                  className={
                    defStyle + staticClass + 
                    (selected === sidx + suggestions.length ? selectStyle : '')
                  }
                  key={'_STATIC:' + staticOption}
                  onMouseDown={handleClick(staticOption)}
                  onMouseEnter={handleMouseOver(sidx + suggestions.length)}
                >
                  {staticOption}
                </li>
                
              ) : null }
            </ul>
          </div>
        </div>

      : null }
    </span>
  );
}

SuggestText.propTypes = {
  suggestionList: PropTypes.arrayOf(PropTypes.object),
  staticList: PropTypes.arrayOf(PropTypes.string),
  value: PropTypes.string,
  className: PropTypes.string,
  suggestClass: PropTypes.string,
  staticClass: PropTypes.string,
  onChange: PropTypes.func,
  onEnter: PropTypes.func,
  onStaticSelect: PropTypes.func,
  isHidden: PropTypes.bool,
}

export default SuggestText;