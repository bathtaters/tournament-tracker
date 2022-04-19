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
    baseColor: 'base-content',
    baseStyle: 'solid',
    disabledColor: 'transparent',
    disabledStyle: '',
    dropColor: 'accent',
    dropStyle: '',
    illegalColor: 'error',
    illegalStyle: '', 
  },
  bg: {
    baseColor: 'neutral',
    disabledColor: 'transparent',
    hoverColor: 'neutral-focus',
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