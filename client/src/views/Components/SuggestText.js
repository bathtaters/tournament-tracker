import React from "react";
import PropTypes from 'prop-types';

const defStyle = "base-bgd dim-color hover:base-bgd-inv hover:base-color-inv py-0.5 px-2 w-full";

const suggestionKey = 'value', uniqueKey = 'id';
const partialMatch = value => {
  const len = value.length;
  // if (!len) return () => false; // Hide all when text box is empty 
  const lower = value.toLowerCase();
  return entry => {
    const entryLower = entry[suggestionKey].toLowerCase();
    return entryLower.slice(0,len) === lower && // Quicker
    // return entryLower.indexOf(lower) > -1 && // More flexible
      entryLower !== lower;
  }
};

function SuggestText({
  value,
  suggestionList = [],
  onChange,
  className = "",
  suggestClass = "",
}) {
  const suggestions = suggestionList.filter(partialMatch(value));
  const handleSuggestClick = suggest => () => {
    onChange({target: { value: suggest[suggestionKey], id: suggest[uniqueKey] } });
  };

  return pug`
    span.inline-block.relative.p
      input(
        type="text"
        value=value
        onChange=onChange
        className=className
      )
      if suggestions.length
        .absolute.top-auto.left-0.z-50.w-full
          .fixed.border.dim-border.shadow-lg
            ul
              each suggest in suggestions
                li(
                  key=suggest[uniqueKey]
                  className=defStyle+suggestClass
                  onClick=handleSuggestClick(suggest)
                )= suggest[suggestionKey]
  `;
}

SuggestText.propTypes = {
  suggestionList: PropTypes.arrayOf(PropTypes.object),
  value: PropTypes.string,
  className: PropTypes.string,
  suggestClass: PropTypes.string,
  onChange: PropTypes.func,
}

export default SuggestText;