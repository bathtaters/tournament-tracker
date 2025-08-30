import Loading from "common/Loading/Loading";
import ListRow from "./components/ListRow";
import ListInput from "./components/ListInput";
import { EditableListStyle } from "./styles/EditableListStyles";
import useEditableListController from "./services/editableList.controller";
import { MouseEventHandler } from "react";

type AutofillOptions = {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  label?: string;
  hidden?: boolean;
};

/** On success, return the added object.
 * Return "OK" if it should not be added to the list
 * and undefined if creation failed.  */
type AddItemMutation = (
  addName: string,
) => Promise<Record<string, any> | "OK" | undefined>;

type EditableListProps = {
  type?: string;
  value: string[];
  onChange: (value: string[]) => void;
  query?: { data: Record<string, any>; isLoading: boolean; error: any };
  autofill?: AutofillOptions;
  create?: {
    mutation?: AddItemMutation;
    label?: string;
    hideOnEmpty?: boolean;
  };
  /** Runs when the display name of a list item is clicked */
  onClick?: (id: string, idx: number) => void;
  isLocked?: boolean;
  /** Runs once, when item is changed for the first time. */
  onFirstChange?: () => void;
  /** Filter predicate tested w/ each data member in the query. */
  filter?: (value: any, key: string) => boolean;
  idKey?: string;
  displayKey?: string;
};

export default function EditableList({
  type = "Item",
  value,
  onChange,
  query,
  autofill = { onClick: null, label: "Autofill" },
  create = { mutation: null, label: "Add", hideOnEmpty: false },
  onClick,
  isLocked = false,
  onFirstChange,
  filter,
  idKey = "id",
  displayKey = "name",
}: EditableListProps) {
  const { data, inputData, popItem, isLoading, error } =
    useEditableListController({
      type,
      value,
      onChange,
      query,
      idKey,
      displayKey,
      filter,
      autofill,
      isLocked,
      onFirstChange,
    });

  // Loading/Error catcher
  if (!data)
    return (
      <EditableListStyle type={type}>
        <Loading
          loading={isLoading}
          error={error}
          altMsg={`${type} data not found`}
        />
      </EditableListStyle>
    );

  return (
    <EditableListStyle type={type} count={value?.length}>
      {value?.map((id, idx) => (
        <ListRow
          name={data[id]?.[displayKey]}
          onClick={!isLocked && popItem(id, idx)}
          onClickName={onClick && onClick(id, idx)}
          key={id}
        />
      ))}

      {!isLocked && <ListInput {...inputData} create={create} />}
    </EditableListStyle>
  );
}
