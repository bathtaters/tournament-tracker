import React, { forwardRef } from "react";
import PropTypes from 'prop-types';

import SuggestList from "./components/SuggestText/SuggestList";
import SuggestTextBox from "./components/SuggestText/SuggestTextBox";
import { WrapperStyle } from "./styles/SuggestTextStyles";

import useSuggestTextController from "./services/SuggestText/suggestText.controller";

// list format: [ { value: "display/filter", id: "uniqueId", isStatic: true/false, className: "class"  }, ... ]
const SuggestText = forwardRef(function SuggestText({ list = [], className = "", listClass = "", onChange, onSubmit, isHidden }, ref) {

  const { boxProps, listProps, showList } = useSuggestTextController(list, isHidden, onChange, onSubmit, ref)

  return (
    <WrapperStyle>
      <SuggestTextBox className={className} isHidden={isHidden} {...boxProps} />
      
      { showList && <SuggestList className={listClass} {...listProps} /> }

    </WrapperStyle>
  )
})

SuggestText.propTypes = {
  list: PropTypes.arrayOf(PropTypes.object),
  className: PropTypes.string,
  listClass: PropTypes.string,
  onChange: PropTypes.func,
  onSubmit: PropTypes.func,
  isHidden: PropTypes.bool,
}

export default SuggestText;