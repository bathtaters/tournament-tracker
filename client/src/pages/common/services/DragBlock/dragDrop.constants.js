// For ExtractMatches

// Run class optimization
export const optimizeClassSwapping = true;

// Class keys to combine
export const combineKeys = [ 'enabled', 'drop', 'illegal' ];
// Output key for common classes
export const COMMON_CLS = 'common';


// Default classes

export const classDefault = {
  border: {
    baseWidth: 'border',
    baseColor: 'border-base-content',
    baseStyle: 'border-solid',
    disabledColor: 'border-transparent',
    disabledStyle: '',
    dropColor: 'border-accent',
    dropStyle: '',
    illegalColor: '',
    illegalStyle: '', 
  },
  bg: {
    baseColor: 'bg-base-300',
    disabledColor: 'bg-transparent',
    hoverColor: 'bg-base-400',
    illegalColor: '',
  },
  additional: {
    enabled: [],
    disabled: [],
    drag: [],
    drop: [],
    illegal: ['cursor-not-allowed'],
  },
};