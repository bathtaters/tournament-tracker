import {
  useEffect,
  useState,
  useRef,
  useTransition,
  useMemo,
  useCallback,
} from "react";
import { getSuggestions, autoSelect } from "./suggestText.services";
import {
  getNext,
  getPrev,
  validList,
  getNonStaticSoloIdx,
  useHotkeys,
} from "./suggestText.utils";
import {
  displayEntry,
  enterBehavior,
  hideListWhenExact,
  getId,
} from "./suggestText.custom";

/** This must be implemented upstream of SuggestText.
 *  - Params:
 *    - `list: object` - List of suggestions of format { id, value, isStatic?, ... }
 *      - `id: string` - Unique ID representing this row
 *      - `value: string` - Display value for this row
 *      - `isStatic: bool?` - If true, this value is not filtered as a suggestion
 *          Displayed as per `hideStaticWhenEmpty` setting
 *      - Additional props will be passed to submit/picked/onSubmit functions
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
 *    - `picked` - Currently selected list entry
 *    - `value: string` - Text inside textbox
 *    - `setValue(value)` - Sets the text inside textbox (React useState function)
 */
export default function useSuggestText(
  list = [],
  { isHidden, onChange, onSubmit, onFocus, hideStaticWhenEmpty } = {}
) {
  // --- Component State --- \\

  // Setup Local State
  const textbox = useRef(null);
  const [, startTransition] = useTransition();
  const [suggestions, setSuggestions] = useState(list);
  const [value, setValue] = useState("");
  const [selected, setSelectedState] = useState(-1);
  const [pickState, setPick] = useState(null);
  const [exact, setExact] = useState(null);
  const [listIsVisible, setListVisible] = useState(false);

  // Basic vars
  const length = suggestions?.length ?? 0;
  const isEmpty = !value || !value.trim();
  const isExact = !isEmpty && exact;
  const selectedValue =
    !isHidden &&
    (selected < 0
      ? length === 1
        ? suggestions[0]
        : null
      : selected < length && suggestions[selected]);
  const nonStaticSoloIdx = useMemo(
    () => getNonStaticSoloIdx(suggestions),
    [suggestions]
  );
  const picked =
    !isHidden &&
    (pickState ||
      isExact ||
      (!isEmpty && nonStaticSoloIdx != null
        ? suggestions[nonStaticSoloIdx]
        : null));

  // Auto update state
  useEffect(() => {
    setSelectedState((selected) => autoSelect(selected, suggestions));
  }, [suggestions]);
  useEffect(() => {
    startTransition(() =>
      getSuggestions(list, value, setSuggestions, setExact, hideStaticWhenEmpty)
    );
    // eslint-disable-next-line
  }, [list]); // Pass prop updates to state

  // --- Action Handlers --- \\

  // Selected setter + side effects
  const setSelected = useCallback(
    (selected) => setSelectedState(autoSelect(selected, suggestions)),
    [suggestions]
  );

  // TextBox controller
  const change = useCallback(
    (e) => {
      if (e.target.value !== value) setValue(e.target.value); // Controlled component

      // Clear pick value
      const newPick =
        e.forcePick ||
        (e.target.value === displayEntry(pickState) && pickState);
      if (pickState && !newPick) setPick(null);

      // Update list
      startTransition(() => {
        const [newSuggestions, newExact] = getSuggestions(
          list,
          e.target.value,
          setSuggestions,
          setExact
        );
        onChange && onChange(e.target.value, newPick, newExact, newSuggestions); // User onChange function
      });
    },
    [value, pickState, list, onChange]
  );

  const handleFocus = (isFocused, e) => {
    setListVisible(isFocused);
    onFocus && onFocus(isFocused, e);
  };

  const submit = async (forcePick) => {
    const newPick = forcePick || picked;

    // Reset form
    setPick(null);
    change({ target: { value: "" } });

    // Submit
    const result = await (onSubmit &&
      onSubmit(value, newPick, exact, suggestions));
    return newPick && { ...newPick, result };
  };

  const pick = (forcePick) => {
    const newPick = forcePick || isExact || selectedValue;

    if (!newPick) return false; // Ignore missing pick
    if (newPick.isStatic) return submit(newPick); // Submit static pick

    const pickDisplay = displayEntry(newPick);
    if (displayEntry(pickState) === pickDisplay) return false; // Already pickState

    // Pick newPick
    change({ target: { value: pickDisplay }, forcePick: newPick });
    setPick(newPick);
  };

  // --- Additional Hooks --- \\

  // Setup Keyboard UI
  useHotkeys(
    {
      Enter: () => enterBehavior(pick, submit, pickState, isExact, value), // Missing from deps
      Escape: () =>
        selected < 0 || nonStaticSoloIdx != null
          ? textbox.current.blur()
          : setSelected(-1),
      ArrowUp: () => setSelected(getPrev(selected, length)),
      ArrowDown: () => setSelected(getNext(selected, length)),
    },
    {
      skip: !listIsVisible,
      deps: [selected, value, length, nonStaticSoloIdx, setSelected],
    }
  );

  const showList =
    listIsVisible && (!hideListWhenExact || !exact) && validList(suggestions);
  return {
    value,
    setValue,
    submit,
    picked,
    backend: {
      boxProps: {
        value,
        handleFocus,
        change,
        showList,
        selected: listIsVisible && getId(selectedValue),
        inputRef: textbox,
      },
      listProps: { suggestions, selected, pick, setSelected, textbox },
      showList,
      isHidden,
    },
  };
}
