import { useState } from "react"
import { validList, getNonStaticSoloIdx } from "./suggestText.utils"
import { hideListWhenEmpty, hideStaticWhenEmpty, adaptEntry, adaptInput, testEntry } from "./suggestText.custom"

// Filter Suggestions logic
export function getSuggestions(list, value, setSuggestions, setExact) {
  // Setup registers/constants
  const len = value.length

  // Hide all when text box is empty 
  if (hideListWhenEmpty && !len) {
    setSuggestions && setSuggestions([])
    setExact && setExact(false)
    return [[]]
  }

  const inputAdapt = adaptInput(value)
  let exact = false
  
  // Filter list
  let matches = list.filter(entry => {
    if (entry.isStatic) return !hideStaticWhenEmpty || len // Static entry filter

    const entryAdapt = adaptEntry(entry) || console.warn('List item is invalid',entry)
    
    if (entryAdapt === inputAdapt) exact = entry // get exact matches
    return testEntry(inputAdapt, entryAdapt, entry)
  })

  setSuggestions && setSuggestions(matches)
  setExact && setExact(exact)
  return [ matches, exact ]
}


// Auto-select rules (Runs on list change)
export const autoSelect = (selected, list, setSelected) => {
  if (!validList(list)) setSelected(-1) // deselect when no list
  else if ((selected < -1 || selected >= list.length)) setSelected(0) // select 1st entry if out of bounds
  else if (selected === -1) setSelected(getNonStaticSoloIdx(list))
}


// Auto-select list item on mouse hover 
export const useSetOnHover = (setter) => {
  const [ lastCoords, setLastCoords ] = useState([])

  return (id) => (ev) => {
    // Ignores if no mouse movement (Fixes unwanted triggers while scrolling)
    if (lastCoords[0] !== ev.screenX || lastCoords[1] !== ev.screenY) setter(id)

    setLastCoords([ev.screenX, ev.screenY])
  }
}