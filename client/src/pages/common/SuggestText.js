import React, { useEffect, useState, useRef, useMemo, useImperativeHandle, forwardRef } from "react";
import PropTypes from 'prop-types';

import SuggestList from "./components/SuggestText/SuggestList";
import SuggestTextBox from "./components/SuggestText/SuggestTextBox";
import { WrapperStyle } from "./styles/SuggestTextStyles";

import actionHandlers from "./services/SuggestText/suggestText.controller";
import { getSuggestions, autoSelect, autoShow } from "./services/SuggestText/suggestText.services"
import { getNext, getPrev, validList } from "./services/SuggestText/suggestText.utils"
import { useHotkeys } from "./services/basic.services";

// list format: [ { value: "display/filter", id: "uniqueId", isStatic: true/false, className: "class"  }, ... ]
const SuggestText = forwardRef(function SuggestText({ list = [], className = "", listClass = "", onChange, onSubmit, isHidden }, ref) {

  // Local State
  const textbox = useRef(null);
  const [value, setValue] = useState("");
  const [selected, setSelected] = useState(-1);
  const [picked, setPick] = useState(null);
  const [listIsVisible, setListVisible] = useState(false);

  // Filter list
  const suggestions = useMemo(() => getSuggestions(list, value), [list, value]);
  
  // Automatically modify state
  useEffect(autoSelect(selected, suggestions, setSelected),   [selected, suggestions]);
  useEffect(autoShow(listIsVisible, textbox, setListVisible), [listIsVisible, textbox]);

  // Build handlers
  const { pick, submit, change, submitOnPicked } = actionHandlers({
    value, selected, picked, suggestions, onSubmit, onChange, setPick, setValue, setListVisible
  });

  // Allow parent to Submit
  useImperativeHandle(ref, () => ({ submit, getValue: () => !isHidden && (picked, {value}) }));

  // Keyboard UI
  useHotkeys({
    /* Enter */ 13: () => submitOnPicked(),
    /* Esc   */ 27: () => selected === -1 ? textbox.current.blur() : setSelected(-1), // Already cap'd by modal
    /* Up    */ 38: () => setSelected(getPrev(selected, suggestions?.length || 0)), 
    /* Down  */ 40: () => setSelected(getNext(selected, suggestions?.length || 0)),
  });

  // Render
  return (
    <WrapperStyle>
      <SuggestTextBox {...{value, isHidden, className, setListVisible, change, setValue}} ref={textbox} />
      
      { listIsVisible && validList(suggestions) && 
        <SuggestList list={suggestions} className={listClass} {...{selected, pick, setSelected}} />
      }
    </WrapperStyle>
  );
});

SuggestText.propTypes = {
  list: PropTypes.arrayOf(PropTypes.object),
  className: PropTypes.string,
  listClass: PropTypes.string,
  onChange: PropTypes.func,
  onSubmit: PropTypes.func,
  isHidden: PropTypes.bool,
}

export default SuggestText;