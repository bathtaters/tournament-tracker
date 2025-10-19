import type { Player } from "types/models";
import EditableList, {
  type EditableListProps,
} from "../../../common/EditableList/EditableList";
import usePlayerEditorController from "../services/playerEditor.controller";

type PlayerEditorProps = Pick<
  EditableListProps,
  "type" | "value" | "onChange" | "onFirstChange"
> & {
  isStarted?: EditableListProps["isLocked"];
  fillAll?: boolean;
};

export default function PlayerEditor({
  type = "Player",
  value,
  onChange,
  isStarted,
  onFirstChange,
  fillAll = false,
}: PlayerEditorProps) {
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
      filter={({ hide }: Partial<Player>) => !hide}
    />
  );
}
