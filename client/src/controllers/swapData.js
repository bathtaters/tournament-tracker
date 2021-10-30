// Copy object replacing rmvKey w/ replObj[replKey]
// IF baseObj isArray = copy array replacing rmvKey == value w/ replObj
const replaceProp = (baseObj, rmvKey, replObj = null, replKey = null) => {
  let newObj;
  if (!baseObj) throw new Error("Error attempting to replace value. Object or Array does not exist.");

  if (Array.isArray(baseObj)) {
    if (replKey && rmvKey)
      newObj = baseObj.map(val => val === rmvKey ? replKey : val);
    else if (rmvKey)
      newObj = baseObj.filter(val => val !== rmvKey);
    else if (replKey)
      newObj = baseObj.concat([replKey]);

  } else {
    newObj = {};
    Object.keys(baseObj || {}).forEach(key => {
      if (key !== rmvKey) newObj[key] = baseObj[key];
      else if (replKey) newObj[replKey] = replObj[replKey];
      else if (replObj) newObj[key] = replObj;
    });
  }
  return newObj;
}

const swapArr = (baseArr, itemA, itemB) =>
  baseArr.map(val => 
    val === itemA ? itemB : val === itemB ? itemA : val
  );

export const swapData = (
  baseData, editKey, matchOn,
  swapFrom, swapTo, swapKey,
  eqTest = (a,b) => a === b,
) => {
  let newData = [...baseData];
  const idxA = newData.findIndex(m => eqTest(m[matchOn], swapFrom[matchOn]));
  const idxB = newData.findIndex(m => eqTest(m[matchOn],   swapTo[matchOn]));

  if (idxA < 0 || idxB < 0) return window.alert("Error editing schedule: Draft not found");
  if (idxA === idxB && !Array.isArray(newData[idxA][editKey])) return;
  if (!newData[idxA][editKey] && !newData[idxB][editKey]) return;
  if (!newData[idxA][editKey]) newData[idxA][editKey] = Array.isArray(newData[idxB][editKey]) ? [] : {};
  if (!newData[idxB][editKey]) newData[idxB][editKey] = Array.isArray(newData[idxA][editKey]) ? [] : {};

  const newA = idxA === idxB ?
    swapArr(
      newData[idxA][editKey],
      swapFrom[swapKey],
      swapTo[swapKey]
    ) :
    replaceProp(
      newData[idxA][editKey], swapFrom[swapKey],
      newData[idxB][editKey],   swapTo[swapKey],
    );
  newData[idxA] = { ...newData[idxA], [editKey]: newA };

  if (idxA !== idxB) {
    const newB = replaceProp(
      newData[idxB][editKey],   swapTo[swapKey],
      baseData[idxA][editKey], swapFrom[swapKey],
    );
    newData[idxB] = { ...newData[idxB], [editKey]: newB };
  }
  return newData;
};