import type { Player } from "types/models";
import EditableList, {
  type EditableListProps,
} from "../../../common/EditableList/EditableList";
import usePlayerEditorController from "../services/playerEditor.controller";

type PlayerEditorProps = Pick<
  EditableListProps<Player>,
  "type" | "value" | "onChange" | "onFirstChange"
> & {
  isStarted?: EditableListProps<Player>["isLocked"];
  fillAll?: boolean;
  ignoreList?: Player["id"][];
  className?: string;
};

export default function PlayerEditor({
  type = "Player",
  value,
  onChange,
  isStarted,
  onFirstChange,
  fillAll = false,
  ignoreList,
  className,
}: PlayerEditorProps) {
  const { query, autofill, create, filter } = usePlayerEditorController(
    type,
    onChange,
    fillAll,
    ignoreList,
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
      filter={filter}
      className={className}
    />
  );
}
