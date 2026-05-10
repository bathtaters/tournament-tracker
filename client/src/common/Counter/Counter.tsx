import CounterStyle from "./CounterStyle";
import { useServerValue } from "../General/common.hooks";
import { counter } from "../../assets/config";

type CounterProps = {
  val: number;
  setVal: (value: number) => any;
  maxVal: number;
  isEditing: boolean;
  suffix?: string | ((value: number) => string);
  className?: string;
};

export default function Counter({
  val,
  setVal,
  maxVal,
  isEditing,
  suffix = "",
  className = "",
}: CounterProps) {
  const [localVal, setLocal] = useServerValue(val, setVal, {
    throttleDelay: counter.updateDelay,
  });

  const displayValue = `${val ?? "-"}${typeof suffix === "function" ? suffix(val) : suffix || ""}`;
  const incrementHandler = () => setLocal((localVal + 1) % (maxVal + 1));

  if (!isEditing) return <span className={className}>{displayValue}</span>;

  return (
    <CounterStyle className={className} onClick={incrementHandler}>
      {displayValue}
    </CounterStyle>
  );
}
