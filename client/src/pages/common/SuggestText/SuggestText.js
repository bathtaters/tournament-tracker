import PropTypes from 'prop-types';
import SuggestList from "./components/SuggestList";
import SuggestTextBox from "./components/SuggestTextBox";
import { WrapperStyle, HiddenList } from "./components/SuggestTextStyles";
import useSuggestText from './services/suggestText.controller'
import { listClassDef } from "./services/suggestText.custom";


function SuggestText({ backend, className, listClasses = listClassDef, label = "suggest-text", placeholder, children }) {

  const { boxProps, listProps, showList, isHidden } = backend

  return (
    <WrapperStyle className={listClasses.main ?? ""}>
      <SuggestTextBox
        className={className ?? listClasses.textbox ?? listClassDef.textbox}
        isHidden={isHidden} placeholder={placeholder} label={label} {...boxProps}
      />
      
      { showList ? <SuggestList classes={listClasses} label={label} {...listProps} /> : <HiddenList label={label} /> }

      { children }

    </WrapperStyle>
  )
}

SuggestText.propTypes = {
  backend: PropTypes.object, /* Pass from useSuggestText */
  className: PropTypes.string,
  listClass: PropTypes.objectOf(PropTypes.string),
  label: PropTypes.string,
  placeholder: PropTypes.string,
  children: PropTypes.any,
}

export { SuggestText, useSuggestText }