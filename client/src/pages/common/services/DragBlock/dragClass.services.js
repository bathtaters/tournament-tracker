// Logic for maniplulating classes
import dragHandle from "./dragHandle.services";
import { extractMatches } from "./dragDrop.utils";
import { COMMON_CLS, classDefault, optimizeClassSwapping } from "./dragDrop.constants";


// Combine custom classes w/ defaults
function getDefaultClasses(customBorder, customBgd, additional) {
  const border  = Object.assign({}, classDefault.border, customBorder);
  const bgd     = Object.assign({}, classDefault.bgd,    customBgd);
  const other   = Object.assign({}, classDefault.additional);
  
  // Add in additional classes
  Object.keys(additional).forEach(c => { 
    if (!other[c]) return;
    else if (typeof additional[c] === 'string') other[c].push(additional[c]);
    else if (Array.isArray(additional[c]))      other[c].push(...additional[c]);
  });

  return { border, bgd, ...other }
}


// Get class array from UI class objects
function toClassArray(base, type, isBorder = false) {
  // Set prefix
  const prefix = '!' + (isBorder ? 'border' : 'bg');
  if (!type) type = 'base';

  // Set defaults (NOTE: behavior specific to params)
  let color, style;
  if (isBorder) {
    color = base[type+'Color'] || base.baseColor;
    style = base[type+'Style'] || base.baseStyle;
  }
  let opacity = base[type+'Opacity'] || base.baseOpacity;

  // Build array
  let classes = [];
  if (color)   classes.push(color);
  if (style)   classes.push(prefix + '-' + style);
  if (opacity) classes.push(prefix + '-opacity-' + opacity);
  return classes;
}


// Get class data
export default function dragClassController(
  borderClass, bgdClass, additionalClasses, droppable, draggable,
  storeData, onDrop, canDrop, storeTestData, dataType
) {
  // Get default classes
  const classes = getDefaultClasses(borderClass, bgdClass, additionalClasses);

  // Build Class arrays
  classes.enabled = classes.enabled
    .concat(toClassArray(classes.border, 'base', true))
    .concat(toClassArray(classes.bgd))
    .concat(draggable ? classes.drag : [])
    .concat(draggable ? ['hover:!bg-opacity-'+classes.bgd.hoverOpacity] : []);

  classes.disabled = classes.disabled
    .concat(toClassArray(classes.border, 'disabled', true))
    .concat(toClassArray(classes.bgd,    'disabled'));
    
  classes.drop    = !droppable ? [] : classes.drop
    .concat(toClassArray(classes.border, 'drop', true))
    .concat(toClassArray(classes.bgd,    'hover'));
    
  classes.illegal = !droppable ? [] : classes.illegal
    .concat(toClassArray(classes.border, 'illegal', true))
    .concat(toClassArray(classes.bgd,    'illegal'));
  
  // Move matching classes to 'common' class array to optimize class swapping
  extractMatches(classes, optimizeClassSwapping);
  
  // Build class strings
  let result = {
    static:  `${classes.border.baseWidth} ${classes.bgd.baseColor}`,
    enable:  `${classes.enabled.join(' ')} ${classes[COMMON_CLS].join(' ')}`,
    disable: classes.disabled.join(' '),
  };

  // Remove excess data
  delete classes.bgd;
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