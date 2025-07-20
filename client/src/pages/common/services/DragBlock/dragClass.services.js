// Logic for maniplulating classes
import { extractMatches } from "./dragDrop.utils";
import {
  COMMON_CLS,
  classDefault,
  optimizeClassSwapping,
} from "./dragDrop.constants";

// Get class names to use based on state
export const getClasses = (className, classes, disabled, isOver, canDrop) =>
  `${className} ${classes[COMMON_CLS]} ${
    disabled
      ? classes.disabled
      : !isOver
        ? classes.enabled
        : canDrop
          ? classes.drop
          : classes.illegal
  }`;

// Combine custom classes w/ defaults
function getDefaultClasses(customBorder, customBgd, additional) {
  const border = Object.assign({}, classDefault.border, customBorder);
  const bg = Object.assign({}, classDefault.bg, customBgd);
  const other = Object.assign({}, classDefault.additional);

  // Add in additional classes
  Object.keys(additional).forEach((c) => {
    if (!other[c]) return;
    else if (typeof additional[c] === "string") other[c].push(additional[c]);
    else if (Array.isArray(additional[c])) other[c].push(...additional[c]);
  });

  return { border, bg, ...other };
}

// Get class array from UI class objects
function toClassArray(base, type, isBorder = false) {
  if (!type) type = "base";

  // Set defaults
  return [
    base[type + "Color"] || base.baseColor,
    isBorder && (base[type + "Style"] || base.baseStyle),
    isBorder && (base[type + "Weight"] || base.baseWeight),
  ].filter(Boolean);
}

// Get class data
export default function dragClassController(
  border,
  bgd,
  other,
  droppable,
  draggable
) {
  // Get default classes
  const classes = getDefaultClasses(border, bgd, other);

  // Build Class arrays
  classes.enabled = classes.enabled
    .concat(toClassArray(classes.border, "base", true))
    .concat(toClassArray(classes.bg))
    .concat(draggable ? classes.drag : []);

  classes.disabled = classes.disabled
    .concat(toClassArray(classes.border, "disabled", true))
    .concat(toClassArray(classes.bg, "disabled"));

  classes.drop = !droppable
    ? []
    : classes.drop
        .concat(toClassArray(classes.border, "drop", true))
        .concat(toClassArray(classes.bg, "hover"));

  classes.illegal = !droppable
    ? []
    : classes.illegal
        .concat(toClassArray(classes.border, "illegal", true))
        .concat(toClassArray(classes.bg, "illegal"));

  delete classes.border;
  delete classes.bg;
  delete classes.drag;

  // Move matching classes to 'common' class array to optimize class swapping
  extractMatches(classes, optimizeClassSwapping);

  // Build class strings
  Object.keys(classes).forEach((c) => {
    classes[c] = classes[c].join(" ");
  });
  return classes;
}
