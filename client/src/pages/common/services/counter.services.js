import { useServerValue } from "../common.hooks"
import { counter } from "../../../assets/config"

// Get Counter value to display
const getDispVal = (val, suff) => val + (typeof suff === 'function' ? suff(val) : suff || '')

// Handle click increase
const incController = (setVal, val, maxVal) => () => setVal((val + 1) % (maxVal + 1))


// Get counter value & setter
export default function useCounterController(val, setVal, maxVal, suff) {
  const [ localVal, setLocal ] = useServerValue(val, setVal, counter.updateDelay)

  return [
    // Display value
    getDispVal(localVal, suff),
    // Increase handler
    incController(setLocal, localVal, maxVal),
  ]
}