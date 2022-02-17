// Logic for event handlers
import { getStored, getPublicData, getDataUsing, classMod } from "./dragDrop.utils";


// Start Drag
function start({ storeData, storeTestData, dataType='text/json' }) {
  return (ev) => {
    ev.dataTransfer.effectAllowed = "move";
    ev.dataTransfer.dropEffect = "move";
    ev.dataTransfer.setData(
      dataType,
      JSON.stringify(getDataUsing(storeData, [ev]))
    );
    if (storeTestData) ev.dataTransfer.setData(
      typeof storeTestData === 'function' ? storeTestData(ev) : storeTestData,
      "PUBLIC"
    );
  };
}

// Apply highlight classes while dragging over
function enter({ classes, canDrop, storeTestData, dataType }) {
  return (ev) => {
    if (canDrop && !canDrop(
      ev.dataTransfer.types,
      getDataUsing(storeTestData, [ev]),
      getPublicData(ev, dataType),
      ev
    )) return classMod(ev, classes.illegal, classes.enabled);
    
    classMod(ev, classes.drop, classes.enabled);
  };
}

function leave({ classes, canDrop, storeTestData, dataType }) {
  return (ev) => {
    if (canDrop && !canDrop(
      ev.dataTransfer.types,
      getDataUsing(storeTestData, [ev]),
      getPublicData(ev, dataType),
      ev
    )) return classMod(ev, classes.enabled, classes.illegal);
    
    classMod(ev, classes.enabled, classes.drop);
  };
}

// End Drag (Highlight Class clears any highlight classes still remaining)
function drop({ classes, onDrop, canDrop, storeData, getCanDropData, dataType='text/json' }) {
  return (ev) => {
    preventDef(ev); ev.stopPropagation();

    if (canDrop && !canDrop(
      ev.dataTransfer.types,
      getDataUsing(getCanDropData, [ev]),
      getPublicData(ev, dataType),
      ev
    )) return classMod(ev, classes.enabled, classes.illegal);

    onDrop(getStored(ev, dataType, true), getDataUsing(storeData, [ev, dataType]));
    
    classMod(ev, classes.enabled, classes.drop);
    return false;
  };
}


export const preventDef = ev => { ev.preventDefault(); return false; };

export default { start, enter, leave, drop, };
