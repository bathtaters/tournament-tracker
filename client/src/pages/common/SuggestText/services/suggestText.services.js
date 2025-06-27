import { useState } from "react"
import { validList, getNonStaticSoloIdx } from "./suggestText.utils"
import { hideListWhenEmpty, adaptEntry, adaptInput, testEntry, logInvalidEntries } from "./suggestText.custom"

// Filter Suggestions logic
export function getSuggestions(list, value, setSuggestions, setExact, hideStaticWhenEmpty) {
  // Setup registers/constants
  const len = value.length

  // Hide all when text box is empty 
  if (hideListWhenEmpty && !len) {
    setSuggestions([])
    setExact(false)
    return [[]]
  }

  const inputAdapt = adaptInput(value)
  let exact = false
  
  // Filter list
  let matches = list.filter(entry => {
    if (entry.isStatic) return !hideStaticWhenEmpty || len // Static entry filter

    const entryAdapt = adaptEntry(entry)
    if (logInvalidEntries && !entryAdapt) console.warn('List item is invalid',entry)
    
    if (entryAdapt === inputAdapt) exact = entry // get exact matches
    return testEntry(inputAdapt, entryAdapt, entry)
  })

  setSuggestions(matches)
  setExact(exact)
  return [ matches, exact ]
}


// Auto-select rules (Runs on list change)
export const autoSelect = (selected, list) => {
  if (selected === -1 || !validList(list)) return -1 // deselect when no list / short-circut deselect
  else if ((selected < -1 || selected >= list.length)) return 0 // select 1st entry if out of bounds
  else if (selected === -1) return getNonStaticSoloIdx(list)
  return selected
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