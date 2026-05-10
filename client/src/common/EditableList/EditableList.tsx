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
) => Promise<Record<string, any> | string | undefined>;

export type EditableListProps<T extends Record<string, any>> = {
  type?: string;
  value: string[];
  onChange: (value: string[]) => void;
  query?: { data?: T; isLoading: boolean; error?: any };
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
  filter?: (value: T[keyof T], key: string) => boolean;
  idKey?: string;
  /** 'Key' from query data to use or transform function. */
  displayValue?: string | ((value: string, data?: T) => string);
  className?: string;
};

export default function EditableList<T extends Record<string, any>>({
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
  displayValue = "name",
  className,
}: EditableListProps<T>) {
  const { data, inputData, popItem, isLoading, error } =
    useEditableListController({
      type,
      value,
      onChange,
      query,
      idKey,
      displayValue,
      filter,
      autofill,
      isLocked,
      onFirstChange,
    });

  // Loading/Error catcher
  if (!data)
    return (
      <EditableListStyle type={type} className={className}>
        <Loading
          loading={isLoading}
          error={error}
          altMsg={`${type} data not found`}
        />
      </EditableListStyle>
    );

  return (
    <EditableListStyle type={type} count={value?.length} className={className}>
      {value?.map((id, idx) => (
        <ListRow
          name={inputData.getDisplay(id, data)}
          onClick={!isLocked && popItem(id, idx)}
          onClickName={onClick && onClick(id, idx)}
          key={id}
        />
      ))}

      {!isLocked && <ListInput {...inputData} create={create} />}
    </EditableListStyle>
  );
}
