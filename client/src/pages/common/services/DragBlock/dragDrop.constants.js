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
    baseColor: 'dimmer-border',
    baseStyle: 'solid',
    baseOpacity: '50',
    disabledColor: '',
    disabledStyle: '',
    disabledOpacity: '0',
    dropColor: 'max-border',
    dropStyle: '',
    dropOpacity: '100',
    illegalColor: 'neg-border',
    illegalStyle: '', 
    illegalOpacity: '100',
  },
  bgd: {
    baseColor: 'max-bgd',
    baseOpacity: '20',
    disabledOpacity: '0',
    hoverOpacity: '50',
    illegalOpacity: ''
  },
  additional: {
    enabled: [],
    disabled: [],
    drag: [],
    drop: [],
    illegal: ['cursor-not-allowed'],
  },
};