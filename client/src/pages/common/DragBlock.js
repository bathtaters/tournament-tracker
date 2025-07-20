import React, { useMemo } from "react";
import PropTypes from "prop-types";

import dragClassController, {
  getClasses,
} from "./services/DragBlock/dragClass.services";
import useDndController from "./services/DragBlock/dragBlock.controller";

function DragBlock({
  type = "text/json",
  item,
  onDrop,
  dropCheck,
  className = "",
  additionalClasses = {},
  borderClass = {},
  bgClass = {},
  draggable = true,
  droppable = true,
  disabled = false,
  onHover = null,
  children,
}) {
  // Build memoized classes
  const classes = useMemo(
    () =>
      dragClassController(
        borderClass,
        bgClass,
        additionalClasses,
        droppable,
        draggable
      ),
    [borderClass, bgClass, additionalClasses, droppable, draggable]
  );

  // Setup Drag & Drop backend
  const { disable, isOver, canDrop, ref } = useDndController(
    type,
    item,
    onDrop,
    dropCheck,
    droppable,
    draggable,
    disabled
  );

  // Render Draggable tag
  return (
    <div
      ref={ref}
      className={getClasses(className, classes, disable, isOver, canDrop)}
    >
      <div onMouseEnter={onHover}>{children}</div>
    </div>
  );
}

DragBlock.propTypes = {
  className: PropTypes.string,
  additionalClasses: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)),
  borderClass: PropTypes.objectOf(PropTypes.string),
  bgClass: PropTypes.objectOf(PropTypes.string),

  storeData: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  onDrop: PropTypes.func,
  canDrop: PropTypes.func,
  storeTestData: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  dataType: PropTypes.string,

  disabled: PropTypes.bool,
  draggable: PropTypes.bool,
  droppable: PropTypes.bool,

  onHover: PropTypes.func,
  children: PropTypes.node,
};

export default DragBlock;
