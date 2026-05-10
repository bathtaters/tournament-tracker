import {
  DateSelectButton,
  DateSelectWrapper,
} from "../styles/DateMultiSelectStyles";
import {
  addOrRemove,
  formatDate,
  useDateRangeList,
} from "../services/plan.utils";

type DateSelectProps = {
  range?: [string, string];
  value: string[];
  onChange?: (dates: string[]) => void;
};

function DateMultiSelect({ range, value, onChange }: DateSelectProps) {
  const dateList = useDateRangeList(range);

  const onUpdate = (idx: number) =>
    onChange(addOrRemove(dateList[idx], value).sort());

  return (
    <DateSelectWrapper>
      {dateList.map((date, idx) => (
        <DateSelectButton
          idx={idx}
          value={value.includes(date)}
          onChange={onUpdate}
          key={date}
        >
          {formatDate(date)}
        </DateSelectButton>
      ))}
    </DateSelectWrapper>
  );
}

export default DateMultiSelect;
