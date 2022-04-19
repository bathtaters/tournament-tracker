import React, { useMemo } from "react";
import PropTypes from 'prop-types';

import { preventDef } from './services/DragBlock/dragHandle.services';
import dragClassController from './services/DragBlock/dragClass.services';
import { getHandler, getClasses } from './services/DragBlock/dragDrop.utils'


function DragBlock({
  className = "", additionalClasses = {},
  borderClass = {}, bgClass = {},
  storeData, onDrop, canDrop, storeTestData,
  dataType='text/json', disabled = false,
  draggable = true, droppable = true,
  onHover = null, onHoverOff = null,
  children, 
}) {

  // Build memoized data
  const classes = useMemo(() => 
    dragClassController(
      borderClass, bgClass, additionalClasses, droppable, draggable,
      storeData, onDrop, canDrop, storeTestData, dataType
    ), [
      borderClass, bgClass, additionalClasses, droppable, draggable,
      storeData, onDrop, canDrop, storeTestData, dataType
    ]
  );

  if (!droppable && !draggable) disabled = true;
  
  // Render Draggable tag
  return (
    <div
      className={getClasses(classes, className, disabled)}
      
      draggable={(!disabled && draggable) || null}
      onDragOver={preventDef}
      onMouseEnter={onHover}
      onMouseLeave={onHoverOff}

      onDragStart={getHandler(classes.onDragStart, disabled)}
      onDragEnter={getHandler(classes.onDragEnter, disabled)}
      onDragLeave={getHandler(classes.onDragLeave, disabled)}
      onDrop={     getHandler(classes.onDrop,      disabled)}
    >
      {children}
    </div>
  );
}


DragBlock.propTypes = {
  className: PropTypes.string,
  additionalClasses: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)),
  borderClass: PropTypes.objectOf(PropTypes.string),
  bgClass: PropTypes.objectOf(PropTypes.string),
  
  storeData: PropTypes.oneOfType([PropTypes.func,PropTypes.object]),
  onDrop: PropTypes.func,
  canDrop: PropTypes.func,
  storeTestData: PropTypes.oneOfType([PropTypes.func,PropTypes.string]),
  dataType: PropTypes.string,

  disabled: PropTypes.bool,
  draggable: PropTypes.bool,
  droppable: PropTypes.bool,

  onHover: PropTypes.func,
  onHoverOff: PropTypes.func,
  children: PropTypes.node,
}

export default DragBlock;