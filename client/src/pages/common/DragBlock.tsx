import { type MouseEventHandler, type ReactNode, useMemo } from "react";
import dragClassController, {
  getClasses,
} from "./services/DragBlock/dragClass.services";
import useDndController from "./services/DragBlock/dragBlock.controller";

type DragBlockProps<T, D> = {
  type?: string;
  item: T;
  onDrop: (droppedItem: D, thisItem: T) => void;
  dropCheck: (type: string, draggedItem: D, thisItem: T) => boolean;

  className: string;
  additionalClasses?: Record<string, string[]>;
  borderClass?: Record<string, string>;
  bgClass?: Record<string, string>;

  draggable?: boolean;
  droppable?: boolean;
  disabled?: boolean;
  onHover?: MouseEventHandler<HTMLDivElement>;
  children?: ReactNode;
};

export default function DragBlock<Type, DropType>({
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
}: DragBlockProps<Type, DropType>) {
  // Build memoized classes
  const classes = useMemo(
    () =>
      dragClassController(
        borderClass,
        bgClass,
        additionalClasses,
        droppable,
        draggable,
      ),
    [borderClass, bgClass, additionalClasses, droppable, draggable],
  );

  // Setup Drag & Drop backend
  const { disable, isOver, canDrop, ref } = useDndController(
    type,
    item,
    onDrop,
    dropCheck,
    droppable,
    draggable,
    disabled,
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
