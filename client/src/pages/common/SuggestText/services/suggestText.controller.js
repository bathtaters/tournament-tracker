import { useEffect, useState, useRef, useImperativeHandle, useTransition } from "react"
import { getSuggestions, autoSelect } from "./suggestText.services"
import { getSelected, getNext, getPrev, validList, getNonStaticSolo, useHotkeys } from "./suggestText.utils"
import { displayEntry, enterBehavior, hideListWhenExact, getId } from "./suggestText.custom"


function useSuggestTextController(list, isHidden, onChange, onSubmit, onFocus, ref) {
  
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
  const getSubmitValue = () => !isHidden && (picked || isExact || (!isEmpty && getNonStaticSolo(suggestions)))

  // Auto update state
  useEffect(() => autoSelect(selected, suggestions, setSelected), [selected, suggestions])
  // eslint-disable-next-line
  useEffect(() => { startTransition(() => getSuggestions(list, value, setSuggestions, setExact)) }, [list]) // Pass prop updates to state

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
    const newPick = forcePick || getSubmitValue()

    // Submit
    const result = await (onSubmit && onSubmit(value, newPick, exact, suggestions))

    // Reset form
    setPick(null)
    change({ target: { value: '' } })
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

  // Allow parent to Submit
  useImperativeHandle(ref, () => ({ submit, getValue: () => ({ ...getSubmitValue(), text: value }) }))

  // Setup Keyboard UI
  useHotkeys({
    Enter:     () => enterBehavior(pick, submit, picked, isExact, value),
    Escape:    () => selected < 0 ? textbox.current.blur() : setSelected(-1),
    ArrowUp:   () => setSelected(getPrev(selected, suggestions?.length || 0)), 
    ArrowDown: () => setSelected(getNext(selected, suggestions?.length || 0)),
  }, { skip: !listIsVisible, deps: [selected, value] })

  const showList = listIsVisible && (!hideListWhenExact || !exact) && validList(suggestions)
  return {
    boxProps:  {
      value, handleFocus, change, showList,
      selected: listIsVisible && getId(selectedValue),
      inputRef: textbox
    },
    listProps: { suggestions, selected, pick, setSelected, textbox },
    showList
  }
}

export default useSuggestTextController