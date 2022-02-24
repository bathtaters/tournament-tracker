import { getSelected } from "./suggestText.utils";

function suggestTextController({ value, selected, picked, suggestions, onSubmit, onChange, setPick, setValue, setListVisible }) {
  
  // Calculate exact match
  const exact = !Array.isArray(suggestions) ? suggestions : suggestions.length === 1 ? suggestions[0] : false;


  // Pick handler
  const pick = (forcePick) => {
    const newPick = forcePick || exact || getSelected(selected, suggestions);
    
    if (!newPick) return false; // Ignore missing pick
    if (newPick.isStatic) return submit(newPick); // Submit static pick

    // Pick newPick
    setPick(newPick);
    setValue(newPick.value);
  };


  // Submit handler
  const submit = (forcePick) => {
    const newPick = forcePick || picked || exact;

    // Submit
    const result = onSubmit && onSubmit(newPick, value);

    // Reset form
    setListVisible(false);
    setPick(null);
    setValue('');
    return newPick && { ...newPick, result };
  };


  // Submit or Pick, whichever makes more sense
  const submitOnPicked = () => picked || exact ? submit() : pick();


  // onChange handler for text box
  const change = (e) => {
    setValue(e.target.value); // Controlled component
    
    if (picked && e.target.value !== picked.value) setPick(null); // Clear pick value

    if (onChange) onChange(e); // Passthrough onChange function
  }

  
  return { pick, submit, change, submitOnPicked };
}

export default suggestTextController;