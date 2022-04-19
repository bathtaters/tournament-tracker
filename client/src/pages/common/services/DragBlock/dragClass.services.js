// Logic for maniplulating classes
import dragHandle from "./dragHandle.services";
import { extractMatches } from "./dragDrop.utils";
import { COMMON_CLS, classDefault, optimizeClassSwapping } from "./dragDrop.constants";

// Use !important before classes
const useImportant = false;

// Combine custom classes w/ defaults
function getDefaultClasses(customBorder, customBg, additional) {
  const border  = Object.assign({}, classDefault.border, customBorder);
  const bg     = Object.assign({}, classDefault.bg,    customBg);
  const other   = Object.assign({}, classDefault.additional);
  
  // Add in additional classes
  Object.keys(additional).forEach(c => { 
    if (!other[c]) return;
    else if (typeof additional[c] === 'string') other[c].push(additional[c]);
    else if (Array.isArray(additional[c]))      other[c].push(...additional[c]);
  });

  return { border, bg, ...other }
}


// Get class array from UI class objects
function toClassArray(base, type, isBorder = false) {
  // Set prefix
  const prefix = (useImportant ? '!' : '') + (isBorder ? 'border' : 'bg');
  if (!type) type = 'base';

  // Set defaults (NOTE: behavior specific to params)
  const color = base[type+'Color'] || base.baseColor;
  const style = isBorder && (base[type+'Style'] || base.baseStyle);

  // Build array
  let classes = [];
  if (color)   classes.push(prefix + '-' + color);
  if (style)   classes.push(prefix + '-' + style);
  return classes;
}


// Get class data
export default function dragClassController(
  borderClass, bgClass, additionalClasses, droppable, draggable,
  storeData, onDrop, canDrop, storeTestData, dataType
) {
  // Get default classes
  const classes = getDefaultClasses(borderClass, bgClass, additionalClasses);

  // Build Class arrays
  classes.enabled = classes.enabled
    .concat(toClassArray(classes.border, 'base', true))
    .concat(toClassArray(classes.bg))
    .concat(draggable ? classes.drag : []);

  classes.disabled = classes.disabled
    .concat(toClassArray(classes.border, 'disabled', true))
    .concat(toClassArray(classes.bg,    'disabled'));
    
  classes.drop    = !droppable ? [] : classes.drop
    .concat(toClassArray(classes.border, 'drop', true))
    .concat(toClassArray(classes.bg,    'hover'));
    
  classes.illegal = !droppable ? [] : classes.illegal
    .concat(toClassArray(classes.border, 'illegal', true))
    .concat(toClassArray(classes.bg,    'illegal'));
  
  // Move matching classes to 'common' class array to optimize class swapping
  extractMatches(classes, optimizeClassSwapping);
  
  // Build class strings
  let result = {
    static:  `${classes.border.baseWidth} ${classes.bg.baseColor}`,
    enable:  `${classes.enabled.join(' ')} ${classes[COMMON_CLS].join(' ')}`,
    disable: classes.disabled.join(' '),
  };

  // Remove excess data
  delete classes.bg;
  delete classes.border;

  // Build drag actions
  const handlerArgs = { classes, storeData, onDrop, canDrop, storeTestData, dataType };
  if (draggable) {
    result.onDragStart = dragHandle.start(handlerArgs);
  }
  if (droppable) {
    result.onDragEnter = dragHandle.enter(handlerArgs);
    result.onDragLeave = dragHandle.leave(handlerArgs);
    result.onDrop      = dragHandle.drop(handlerArgs);
  }

  return result;
}