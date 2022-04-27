import React from "react"

import { FormErrorStyle } from "../../styles/InputFormStyles"

import { findNested } from "../../services/InputForm/inputForm.services"
import { formErrorMessages } from "../../../../assets/constants"

// Get label based off fieldID
const getLabel = (fieldId, rows) => findNested(rows, ({ id }) => id === fieldId)?.label ?? fieldId

// Translate to human-readable message, or return default "<field label>: <error type>"
const getMessage = (type, label, limits = {}) =>
  formErrorMessages[type] ? formErrorMessages[type]({ ...limits, label }) : `${label}: ${type}`

// Alert of Form Errors
function FormError({ errors, rows, limits }) {
  if (!errors || !Object.keys(errors).length) return;

  return (
    <FormErrorStyle>{
      Object.entries(errors).map(([ id, err ]) =>
        <p key={id}>{err.message || getMessage(err.type, getLabel(id, rows), limits?.[id])}</p>
      )
    }</FormErrorStyle>
  )
}

export default FormError