import CounterStyle from "./styles/CounterStyle";
import useCounterController from "./services/counter.services";

type CounterProps = {
  val: number;
  setVal: (value: number) => void;
  maxVal: number;
  isEditing: boolean;
  suffix: string | ((value: number) => void);
  className: string;
};

export default function Counter({
  val,
  setVal,
  maxVal,
  isEditing,
  suffix = "",
  className = "",
}: CounterProps) {
  const [displayVal, incVal] = useCounterController(
    val,
    setVal,
    maxVal,
    suffix,
  );

  if (!isEditing) return <span className={className}>{displayVal}</span>;

  return (
    <CounterStyle className={className} onClick={incVal}>
      {displayVal}
    </CounterStyle>
  );
}
