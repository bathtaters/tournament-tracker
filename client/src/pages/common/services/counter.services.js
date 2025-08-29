import { useServerValue } from "../common.hooks";
import { counter } from "../../../assets/config";

// Get Counter value to display
const getDispVal = (val, suffix) =>
  val + (typeof suffix === "function" ? suffix(val) : suffix || "");

// Handle click increase
const incController = (setVal, val, maxVal) => () =>
  setVal((val + 1) % (maxVal + 1));

// Get counter value & setter
export default function useCounterController(val, setVal, maxVal, suffix) {
  const [localVal, setLocal] = useServerValue(val, setVal, counter.updateDelay);

  return [
    // Display value
    getDispVal(localVal, suffix),
    // Increase handler
    incController(setLocal, localVal, maxVal),
  ];
}
