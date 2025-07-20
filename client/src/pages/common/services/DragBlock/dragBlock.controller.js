import { useDrag, useDrop } from "react-dnd";

function useDndController(
  type,
  item,
  onDrop,
  dropCheck,
  droppable,
  draggable,
  disabled
) {
  // Simple data
  const disable = disabled || (!draggable && !droppable);
  const flatItem = JSON.stringify(item);

  // Setup drag/drop backend
  const [, drag] = useDrag(
    () => ({
      type,
      item,
      canDrag: () => !disable && draggable,
    }),
    [type, draggable, disable, flatItem]
  );

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: type,
      canDrop: (dropped, monitor) =>
        !disable &&
        droppable &&
        dropCheck(monitor.getItemType(), dropped, item),
      drop: (dropped, monitor) => monitor.didDrop() || onDrop(dropped, item),
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
      }),
    }),
    [type, droppable, disable, flatItem]
  );

  return {
    disable,
    isOver,
    canDrop,
    ref: (node) => (disable ? node : drag(drop(node))),
  };
}

export default useDndController;
