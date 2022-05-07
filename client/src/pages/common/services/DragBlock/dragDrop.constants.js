// For ExtractMatches

// Run class optimization
export const optimizeClassSwapping = true
// Class keys to combine
export const combineKeys = [ 'enabled', 'disabled', 'drop', 'illegal' ]
// Output key for common classes
export const COMMON_CLS = 'common'

// Default classes
export const classDefault = {
  border: {
    baseWeight: 'border',
    baseColor: 'border-neutral-content',
    baseStyle: 'border-solid',
    disabledColor: 'border-transparent',
    disabledStyle: '',
    dropColor: 'border-accent',
    dropStyle: '',
    illegalColor: '',
    illegalStyle: '', 
  },
  bg: {
    baseColor: 'bg-neutral',
    disabledColor: 'bg-transparent',
    hoverColor: 'bg-neutral-focus',
    illegalColor: '',
  },
  additional: {
    enabled: [],
    disabled: [],
    drag: ['cursor-move','hover:bg-neutral-content','hover:bg-opacity-20'],
    drop: [],
    illegal: [],
  },
}