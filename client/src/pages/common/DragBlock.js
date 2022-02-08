import React from "react";
import PropTypes from 'prop-types';

import dragHandle, { preventDef } from './services/dragAndDrop.services';


// Create new array w/ elements common to all arrays
// Returns array of arrays (+1 index) w/ matching array @ index 0
const extractMatches = (arrays) => {
  const arrs = arrays.slice(1);
  let indexes, result = [[],[]].concat(arrs.map(a => a.slice()));
  for (const entry of arrays[0]) {
    indexes = [];
    for (const i in arrs) {
      const nextIdx = result[+i+2].indexOf(entry); 
      if (nextIdx === -1) break;
      indexes.push(nextIdx);
    }

    if (indexes.length !== arrs.length)
      result[1].push(entry); 
    else {
      result[0].push(entry);
      indexes.forEach((index,i) => result[i+2].splice(index,1));
    }
  }
  return result;
};




// Options

const optimizeClassSwapping = true;

// Default classes

const borderClassDefault = {
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
}

const bgdClassDefault = {
  baseColor: 'max-bgd',
  baseOpacity: '20',
  disabledOpacity: '0',
  hoverOpacity: '50',
  illegalOpacity: ''
};

const additionalClassDefault = {
  enabled: [],
  disabled: [],
  drag: [],
  drop: [],
  illegal: ['cursor-not-allowed'],
};

// Get class array from UI class objects
const toClassArray = (base, type, isBorder = false) => {
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
};


// Component

function DragBlock({
  storeData, onDrop, children, canDrop, storeTestData,
  className = "", additionalClasses = {},
  borderClass = {}, bgdClass = {},
  dataType='text/json', disabled = false,
  draggable = true, droppable = true,
  onHover = null, onHoverOff = null,
}) {

  // Set defaults if unset by user
  const brdAgg = Object.assign({}, borderClassDefault, borderClass);
  const bgdAgg = Object.assign({}, bgdClassDefault, bgdClass);
  Object.keys(additionalClassDefault).forEach(c => { 
    if (typeof additionalClasses[c] === 'string') additionalClasses[c] = [additionalClasses[c]];
    else if (!Array.isArray(additionalClasses[c])) additionalClasses[c] = additionalClassDefault[c];
  });

  // Disable drag/drop if not draggable or droppable
  if (!droppable && !draggable) disabled = true;

  // Build Class arrays
  let enableCls = additionalClasses.enabled
    .concat(draggable ? additionalClasses.drag : [])
    .concat(toClassArray(brdAgg, 'base', true))
    .concat(toClassArray(bgdAgg))
    .concat(draggable ? ['hover:!bg-opacity-'+bgdAgg.hoverOpacity] : []);

  let disableCls = additionalClasses.disabled
    .concat(toClassArray(brdAgg, 'disabled', true))
    .concat(toClassArray(bgdAgg, 'disabled'));
    
  let legalDropCls = !droppable ? [] : additionalClasses.drop
    .concat(toClassArray(brdAgg, 'drop', true))
    .concat(toClassArray(bgdAgg, 'hover'));
    
  let illegalDropCls = !droppable ? [] : additionalClasses.illegal
    .concat(toClassArray(brdAgg, 'illegal', true))
    .concat(toClassArray(bgdAgg, 'illegal'));
  
  // Eliminate matching classes to optimize class swapping
  let matches = [];
  if (optimizeClassSwapping)
    [matches, enableCls, legalDropCls, illegalDropCls] = extractMatches([enableCls, legalDropCls, illegalDropCls]);
  
  // Build class strings
  const staticClsStr = `${brdAgg.baseWidth} ${bgdAgg.baseColor} ${className}`;
  const enableClsStr = enableCls.join(' ') + (enableCls.length && matches.length ? ' ' : '') + matches.join(' ');
  const disableClsStr = disableCls.join(' ');

  return (
    <div
      className={`${staticClsStr} ${disabled ? disableClsStr : enableClsStr}`}

      draggable={!disabled && draggable ? true : null}
      onDragOver={preventDef}
      onMouseEnter={onHover}
      onMouseLeave={onHoverOff}

      onDragStart={!disabled && draggable ?
        dragHandle.start(storeData, storeTestData, dataType)
      : null}
      onDrop={!disabled && droppable ? 
        dragHandle.drop(
          storeData,
          onDrop,
          legalDropCls,
          enableCls,
          illegalDropCls,
          canDrop,
          storeTestData,
          dataType
        )
      : null}
      onDragEnter={!disabled && droppable ?
        dragHandle.enter(
          legalDropCls,
          enableCls,
          illegalDropCls,
          canDrop,
          storeTestData,
          dataType
        )
      : null}
      onDragLeave={!disabled && droppable ?
        dragHandle.leave(
          legalDropCls,
          enableCls,
          illegalDropCls,
          canDrop,
          storeTestData,
          dataType
        )
      : null}
    >
      {children}
    </div>
  );
}

DragBlock.propTypes = {
  storeData: PropTypes.oneOfType([PropTypes.func,PropTypes.object]),
  onDrop: PropTypes.func,
  children: PropTypes.node,
  canDrop: PropTypes.func,
  storeTestData: PropTypes.oneOfType([PropTypes.func,PropTypes.string]),

  className: PropTypes.string,
  additionalClasses: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)),
  borderClass: PropTypes.objectOf(PropTypes.string),
  bgdClass: PropTypes.objectOf(PropTypes.string),
  
  dataType: PropTypes.string,
  disabled: PropTypes.bool,
  draggable: PropTypes.bool,
  droppable: PropTypes.bool,

  onHover: PropTypes.func,
  onHoverOff: PropTypes.func,
}

export default DragBlock;