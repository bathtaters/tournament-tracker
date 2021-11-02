import React, { useEffect, useState, useRef } from "react";
import PropTypes from 'prop-types';

const defStyle = "base-bgd dim-color py-0.5 px-2 w-full ";
const selectStyle = " base-bgd-inv base-color-inv";

const suggestionKey = 'name', uniqueKey = 'id';

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
      if (onStaticSelect(select, value)) return;
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

  return pug`
    span.inline-block.relative.p-1
      input(
        type="text"
        value=value
        onChange=onChange
        onFocus=showList
        onBlur=hideList
        ref=textbox
        className=(className+(isHidden ? " invisible" : ""))
      )
      if listIsVisible && !isSolo && listCount
        .absolute.top-auto.left-0.z-50.w-full
          .fixed.border.dim-border.shadow-lg
            ul
              each suggest, idx in suggestions
                li(
                  key=suggest[uniqueKey]
                  className=defStyle+suggestClass+(selected === idx ? selectStyle : "")
                  onMouseDown=handleClick(suggest)
                  onMouseEnter=handleMouseOver(idx)
                )= suggest[suggestionKey]
              
              if value
                each staticOption, sidx in staticList
                  -var i = sidx + suggestions.length
                  li(
                    key="_STATIC:"+staticOption
                    className=defStyle+staticClass+(selected === i ? selectStyle : "")
                    onMouseDown=handleClick(staticOption)
                    onMouseEnter=handleMouseOver(i)
                  )= staticOption
  `;
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