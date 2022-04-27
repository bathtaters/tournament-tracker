import { elementDefaults, typeDefaults } from "../../styles/InputFormStyles"

// Default inputElement.type
export const defaultInputType = 'text'

// Get styling data
export default function getClasses(props) {
  // Assign defaults to missing classes
  let elementClasses = {}
  Object.keys(elementDefaults).forEach((key) => {
    elementClasses[key] = props[key] ?? elementDefaults[key];
  })
  
  // Fix for number picker styling
  if (props.type === 'number' && !elementClasses.inputClass) elementClasses.inputClass = typeDefaults.numberSize

  // Add DaisyUI classes
  elementClasses.inputClass += ` ${typeDefaults[props.type || defaultInputType] || props.type}`

  return { 
    ...elementClasses,

    // Get label positioning (default: top)
    labelType: {
      first: !props.labelPosition || props.labelPosition === 'top' || props.labelPosition === 'left',
      nest: props.labelPosition === 'left' || props.labelPosition === 'right',
    }
  }
}
