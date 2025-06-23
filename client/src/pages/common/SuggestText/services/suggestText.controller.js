import { useEffect, useState, useRef, useTransition } from "react"
import { getSuggestions, autoSelect } from "./suggestText.services"
import { getSelected, getNext, getPrev, validList, getNonStaticSolo, useHotkeys } from "./suggestText.utils"
import { displayEntry, enterBehavior, hideListWhenExact, getId } from "./suggestText.custom"

/** This must be implemented upstream of SuggestText.
 *  - Params:
 *    - `list: object` - List of suggestions of format { id, value, isStatic?, ... }
 *      - `id: string` - Unique ID representing this row
 *      - `value: string` - Display value for this row
 *      - `isStatic: bool?` - If true, this value is not filtered as a suggestion
 *          Displayed as per `hideStaticWhenEmpty` setting
 *      - Additional props will be passed to submit/getPick/onSubmit functions
 *    - `options: object` - Optional options of format { isHidden, onChange/Submit/Focus, hideStaticWhenEmpty }
 *      - `isHidden: bool` - If true, text box is hidden
 *      - `onChange(value, pick, exact, suggestions)` - Called whenever the text value changes
 *      - `onSubmit(value, pick, exact, suggestions)` - Called whenever a value is submitted
 *        - `value: string` - Current value of text box
 *        - `pick: { id, value, ... }?` - Currently selected list entry
 *        - `exact: { id, value, ... }?` - List entry only if it is an exact match
 *        - `suggestions: [{ id, value, ... }]` - List of suggested entries
 *      - `onFocus(isFocused, event)` - Called whenever the box is focused/blurred
 *        - `isFocused: bool` - Indicate whether the event is a focus or blur event
 *        - `event: DOM Event` - Passed from listener
 *      - `hideStaticWhenEmpty: bool` - By default, entries with `isStatic`=TRUE are always visible,
 *          when this is set to TRUE, these entries will be hidden when the text field is empty
 *  - Returns:
 *    - `backend: object` - Opaque object that should be passed to SuggestText
 *    - `submit(force?)` - Submits currently selected value (Or `force` if included).
 *      - `force: { id, value, isStatic }?` - List entry to force-submit
 *      - Returns: `Promise<{ id, value, isStatic, result }>` - Submitted list entry w/ result of onSubmit() (if implemented)
 *    - `getPick()` - Returns the currently selected list entry, without submitting
 *    - `value: string` - Text inside textbox
 *    - `setValue(value)` - Sets the text inside textbox (React useState function)
 */
export default function useSuggestText(list = [], { isHidden, onChange, onSubmit, onFocus, hideStaticWhenEmpty } = {}) {
  
  // --- Component State --- \\

  // Setup Local State
  const textbox = useRef(null)
  const [, startTransition] = useTransition()
  const [suggestions, setSuggestions] = useState(list)
  const [value, setValue] = useState("")
  const [selected, setSelected] = useState(-1)
  const [picked, setPick] = useState(null)
  const [exact, setExact] = useState(null)
  const [listIsVisible, setListVisible] = useState(false)

  // Basic vars
  const isEmpty = !value || !value.trim()
  const isExact = !isEmpty && exact //(!Array.isArray(suggestions) ? suggestions : suggestions.length === 1 ? suggestions[0] : false)
  const selectedValue = !isHidden && getSelected(selected, suggestions)
  const getPick = () => !isHidden && (picked || isExact || (!isEmpty && getNonStaticSolo(suggestions)))

  // Auto update state
  useEffect(() => autoSelect(selected, suggestions, setSelected), [selected, suggestions])
  // eslint-disable-next-line
  useEffect(() => { startTransition(() => getSuggestions(list, value, setSuggestions, setExact, hideStaticWhenEmpty)) }, [list]) // Pass prop updates to state

  // --- Action Handlers --- \\

  // TextBox controller
  const change = (e) => {
    if (e.target.value !== value) setValue(e.target.value) // Controlled component

    // Clear pick value
    const newPick = e.forcePick || (e.target.value === displayEntry(picked) && picked)
    if (picked && !newPick) setPick(null)

    // Update list
    startTransition(() => {
      const [newSuggestions, newExact] = getSuggestions(list, e.target.value, setSuggestions, setExact)
      onChange && onChange(e.target.value, newPick, newExact, newSuggestions) // User onChange function
    })
  }

  const handleFocus = (isFocused, e) => {
    setListVisible(isFocused)
    onFocus && onFocus(isFocused, e)
  }

  const submit = async (forcePick) => {
    const newPick = forcePick || getPick()

    // Reset form
    setPick(null)
    change({ target: { value: '' } })
    
    // Submit
    const result = await (onSubmit && onSubmit(value, newPick, exact, suggestions))
    return newPick && { ...newPick, result }
  }

  const pick = (forcePick) => {
    const newPick = forcePick || isExact || selectedValue
    
    if (!newPick) return false // Ignore missing pick
    if (newPick.isStatic) return submit(newPick) // Submit static pick

    const pickDisplay = displayEntry(newPick)
    if (displayEntry(picked) === pickDisplay) return false // Already picked

    // Pick newPick
    change({ target: { value: pickDisplay }, forcePick: newPick })
    setPick(newPick)
  }

  // --- Additional Hooks --- \\

  // Setup Keyboard UI
  useHotkeys({
    Enter:     () => enterBehavior(pick, submit, picked, isExact, value),
    Escape:    () => selected < 0 ? textbox.current.blur() : setSelected(-1),
    ArrowUp:   () => setSelected(getPrev(selected, suggestions?.length || 0)), 
    ArrowDown: () => setSelected(getNext(selected, suggestions?.length || 0)),
  }, { skip: !listIsVisible, deps: [selected, value] })

  const showList = listIsVisible && (!hideListWhenExact || !exact) && validList(suggestions)
  return {
    value, setValue, submit, getPick,
    backend: {
      boxProps:  {
        value, handleFocus, change, showList,
        selected: listIsVisible && getId(selectedValue),
        inputRef: textbox,
      },
      listProps: { suggestions, selected, pick, setSelected, textbox },
      showList,
      isHidden,
    }
  }
}
