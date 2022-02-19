import React, { useEffect, useState, useRef } from "react";
import PropTypes from 'prop-types';

import SuggestList from "./components/SuggestText/SuggestList";
import SuggestTextBox from "./components/SuggestText/SuggestTextBox";
import { WrapperStyle, BoxStyle } from "./styles/SuggestTextStyles";

import { hotkeyListener, hotkeyController } from "./services/basic.services";
import { getSuggestions, chooseController } from "./services/SuggestText/suggestText.services"
import { getSelected, autoSelect, getNext, getPrev, enterHandler } from "./services/SuggestText/suggestText.utils"


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

  // Local State
  const [listIsVisible, setListVisible] = useState(false);
  const [selected, setSelected] = useState(-1);
  const textbox = useRef(null);

  // Get base list
  const { suggestions, isSolo } = getSuggestions(suggestionList, value);
  const listCount = suggestions.length + staticList.length;

  // Auto-select rules
  useEffect(autoSelect(selected, listCount, suggestions.length === 1, setSelected), [selected, listCount, suggestions]);

  // Select list item handlers
  const getCurrent = () => isSolo || getSelected(selected, suggestions, staticList);
  const chooseStatic = onStaticSelect && ((select) => onStaticSelect(value, select));
  const choose = chooseController(getCurrent, chooseStatic, onChange, setSelected);

  // Keyboard UI
  const keystrokeHandler = hotkeyController({
    /* Enter */ 13: () => enterHandler(isSolo, onEnter, choose),
    /* Esc   */ 27: () => selected === -1 ? textbox.current.blur() : setSelected(-1),
    /* Up    */ 38: () => setSelected(getPrev(selected, listCount)), 
    /* Down  */ 40: () => setSelected(getNext(selected, listCount)),
  });
  useEffect(hotkeyListener(keystrokeHandler));

  // Render
  return (
    <WrapperStyle>
      <SuggestTextBox {...{value, isHidden, className, setListVisible, onChange}} ref={textbox} />
      
      { listIsVisible && !isSolo && Boolean(listCount) && 
        <BoxStyle>
          <SuggestList list={suggestions} className={suggestClass} {...{selected, choose, setSelected}} />

          { Boolean(value) && 
            <SuggestList list={staticList} className={staticClass} offset={suggestions.length} {...{selected, choose, setSelected}} />
          }
        </BoxStyle>
      }
    </WrapperStyle>
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