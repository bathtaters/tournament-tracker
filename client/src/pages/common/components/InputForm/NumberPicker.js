import React from "react"
import useNumberPicker, { invalidHandler } from "../../services/InputForm/numberPicker.controller"

export default function NumberPicker({ inputProps, backend, className, wrapperClass }) {
  const { decHandler, incHandler } = useNumberPicker(inputProps, backend)

  return (
    <div className={"join "+wrapperClass}>
      <button type="button" data-action="decrement" className="btn btn-ghost btn-sm sm:btn-md join-item" onClick={decHandler}>－</button>
      <input {...inputProps} className={"join-item "+className} onInvalid={invalidHandler} pattern="\\d*" />
      <button type="button" data-action="increment" className="btn btn-ghost btn-sm sm:btn-md join-item" onClick={incHandler}>＋</button>
    </div>
  )
}