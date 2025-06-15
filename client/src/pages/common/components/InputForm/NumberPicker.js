import useNumberPicker, { invalidHandler } from "../../services/InputForm/numberPicker.controller"

export default function NumberPicker({ inputProps, backend, className = "", wrapperClass = "" }) {
  const { decHandler, incHandler } = useNumberPicker(inputProps, backend)

  return (
    <div className={`join ${wrapperClass}`}>
      { !inputProps.disabled && <NumberButtonStyle increment={false} handler={decHandler} /> }
      <input {...inputProps} className={`join-item ${className}`} onInvalid={invalidHandler} />
      { !inputProps.disabled && <NumberButtonStyle increment={true}  handler={incHandler} /> }
    </div>
  )
}

const NumberButtonStyle = ({ increment, handler }) => (
  <button
    type="button"
    data-action={increment ? "increment" : "decrement"}
    className="btn btn-ghost btn-sm sm:btn-md join-item"
    disabled={!handler}
    onClick={handler}
  >
    {increment ? "＋" : "－"}
  </button>
)