import React from "react"
import useNumberPicker, { invalidHandler } from "../../services/InputForm/numberPicker.controller"

export default function NumberPicker({ inputProps, backend, className, wrapperClass }) {
  const { decHandler, incHandler } = useNumberPicker(inputProps, backend)

  return (
    <div className={"input-group "+wrapperClass}>
      <button type="button" data-action="decrement" className="btn btn-ghost btn-sm sm:btn-md" onClick={decHandler}>－</button>
      <input {...inputProps} className={className+' h-8 sm:h-12'} onInvalid={invalidHandler} pattern="\\d*" />
      <button type="button" data-action="increment" className="btn btn-ghost btn-sm sm:btn-md" onClick={incHandler}>＋</button>
    </div>
  )
}