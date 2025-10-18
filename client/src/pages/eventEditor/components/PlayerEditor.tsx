import EditableList from "../../../common/EditableList/EditableList";
import usePlayerEditorController from "../services/playerEditor.controller";

function PlayerEditor({
  type = "Player",
  value,
  onChange,
  isStarted,
  onFirstChange,
  fillAll = false,
}) {
  const { query, autofill, create } = usePlayerEditorController(
    type,
    onChange,
    fillAll,
  );

  return (
    <EditableList
      type={type}
      value={value}
      onChange={onChange}
      query={query}
      autofill={autofill}
      create={create}
      isLocked={isStarted}
      onFirstChange={onFirstChange}
      filter={({ hide }) => !hide}
    />
  );
}

export default PlayerEditor;
