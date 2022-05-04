import React from "react"

import { FormErrorStyle } from "../../styles/InputFormStyles"

import { findNested } from "../../services/InputForm/inputForm.services"
import { formErrorMessages, formErrorData } from "../../../../assets/constants"

// Get label based off fieldID
const getLabel = (fieldId, rows) => findNested(rows, ({ id }) => id === fieldId)?.label ?? fieldId

// Translate to human-readable messages (recursively)
const getMessage = (error, label) =>
  // Recursively call arrays
  Array.isArray(error) ? error.map((err) => getMessage(err, label)).filter(Boolean).join(', ') :
  // Get error message from template
  formErrorMessages[error.type] ? formErrorMessages[error.type]({ ...formErrorData(error.ref), label }) :
  // Default message if no template exists
  `${label}: ${error.type} error`


// Alert of Form Errors
function FormError({ errors, rows }) {
  if (!errors || !Object.keys(errors).length) return;

  return (
    <FormErrorStyle>{
      Object.entries(errors).map(([ id, err ]) =>
        <p key={id}>{err.message || getMessage(err, getLabel(id, rows))}</p>
      )
    }</FormErrorStyle>
  )
}

export default FormError