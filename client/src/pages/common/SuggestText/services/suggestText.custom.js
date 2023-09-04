// ---- Customization ---- \\

import { suggestText, debugLogging } from '../../../../assets/config'

// Hide 'static' entries, Hide list when text-box is empty
export const logInvalidEntries = debugLogging, // Log to console when list contains invalid entries
  hideListWhenEmpty = suggestText.hideListWhenEmpty,
  hideListWhenExact = suggestText.hideListWhenExact

// adapt list entry for display
export const displayEntry = (entry) => entry?.value

// adapt input text for comparison
export const adaptInput = (inputVal) => inputVal.toUpperCase()

// adapt list entry for comparison
export const adaptEntry = (entry) => entry.value?.toUpperCase() // Get 'entry' name

// run comparison
export const testEntry = (inputAdapt, entryAdapt, entryOrig) => (
  entryAdapt && entryAdapt.slice(0,inputAdapt.length) === inputAdapt // Quicker
  // entryAdapt.indexOf(inputAdapt) !== -1 // More flexible
)

// What to do on <Enter> options: (pick(), submit(), currentPick, isSolo, inputVal)
export const enterBehavior = (pick, submit, picked) => picked ? submit() : pick()

// unique ID for each entry
export const getId  = (entry) => entry?.id || entry?.value || 'none'

// Customized styling
export const listClassDef = {
  wrapper: "border border-base-300 shadow-neutral shadow-md",
  base: "w-full py-0.5 px-2 text-base line-clamp-2 break-words text-ellipsis cursor-default",
  select: "bg-base-300 text-base-content",
  unselect: "bg-base-100 text-base-content",
  textbox: "w-40 h-full py-1 input input-sm input-bordered align-middle",
}

// Layout-based styling
export const layoutClasses = {
  containerWrapper: "relative p-1 inline-block",
  listWrapper: "absolute z-10 top-auto mb-0.5 rounded-lg overflow-y-auto overflow-x-hidden",
  listSideInset: 4, // for rounded edge (px)
  listTopMargin: 8, // space away from top of page (px)
  overrideMaxHeight: '12rem', // Overrides automatic setting of max-height
}