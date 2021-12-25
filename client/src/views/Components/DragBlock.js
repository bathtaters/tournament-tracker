import React from "react";
import PropTypes from 'prop-types';

import dragHandle, { preventDef } from '../../controllers/dragAndDrop';

function DragBlock({
  storeData, onDrop, children, canDrop, storeTestData, dataType='text/json',
  className = "", unavailableCls = "", availableCls = "",
  highlightClsArray = [], illegalClsArray = [],
  draggable = true, droppable = true, isAvailable = true,
  onHover=null, onHoverOff=null,
}) {
  const highlightBase = ['border-double','bg-opacity-50','max-border'];
  const illegalBase = []; //['border-double','bg-opacity-50','max-border', 'neg-border', 'neg-bgd'];
  const availableBase = "border-opacity-100 border-dashed dimmer-border" +
    (draggable ? " hover:bg-opacity-50" : "");
  const highlightCombo = highlightClsArray && highlightClsArray.length ?
    highlightBase.concat(highlightClsArray) : highlightBase;
  const illegalCombo = illegalClsArray && illegalClsArray.length ?
    illegalBase.concat(highlightClsArray) : illegalBase;

  return pug`
    .border.max-bgd.bg-opacity-0.border-opacity-0(
      className=(isAvailable ? availableBase : unavailableCls)+" "+className
      draggable=(isAvailable && draggable)
      onDragStart=(draggable ? dragHandle.start(storeData, storeTestData, dataType) : null)
      onDragEnter=dragHandle.enter(highlightCombo, illegalCombo, canDrop, storeTestData, dataType)
      onDragOver=preventDef
      onDragLeave=dragHandle.leave(highlightCombo, illegalCombo, canDrop, storeTestData, dataType)
      onDrop=(droppable ? dragHandle.drop(storeData, onDrop, highlightCombo, canDrop, storeTestData, dataType) : null)
      onMouseEnter=onHover
      onMouseLeave=onHoverOff
    )= children
  `;
}

DragBlock.propTypes = {
  storeData: PropTypes.oneOfType([PropTypes.func,PropTypes.object]),
  onDrop: PropTypes.func,
  children: PropTypes.node,
  canDrop: PropTypes.func,
  storeTestData: PropTypes.oneOfType([PropTypes.func,PropTypes.string]),
  dataType: PropTypes.string,
  className: PropTypes.string,
  highlightClsArray: PropTypes.arrayOf(PropTypes.string),
  illegalClsArray: PropTypes.arrayOf(PropTypes.string),
  unavailableCls: PropTypes.string,
  availableCls: PropTypes.string,
  draggable: PropTypes.bool,
  droppable: PropTypes.bool,
  isAvailable: PropTypes.bool,
  onHover: PropTypes.func,
  onHoverOff: PropTypes.func,
}

export default DragBlock;