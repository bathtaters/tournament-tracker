import React from "react"
import LoadingSpinner from "../../common/components/LoadingSpinner"
import { useScaleToFitRef } from "../../common/common.hooks"

// Wrapper
export const NotesWrapperStyle = React.forwardRef(function NotesWrapperStyle({ children }, ref) {
  return <div className="my-2 mx-10"><div className="indicator w-full" ref={ref}>{children}</div></div>
})

// Main Component
export function NotesStyle(props) {
  const ref = useScaleToFitRef([props.value], { padding: 2 })
  return (
    <textarea
      className="textarea textarea-bordered font-light text-xs sm:text-sm px-2 py-1 resize-none w-full"
      ref={ref} {...props}
    />
  )
}

// Wrapper Overlay
export function NotesOverlayStyle({ visible, onClick, children }) {
  if (!visible) return null
  return (
    <div className="absolute top-0 bottom-0 left-0 right-0 z-10 rounded-lg flex bg-base-200 opacity-30" onClick={onClick}>
      <div className="m-auto pb-1 text-base-content italic font-thin cursor-pointer">{children}</div>
    </div>
  )
}

// Character Counter
export function CharCountStyle({ visible, children }) {
  if (!visible) return null
  return <div className="indicator-item indicator-bottom badge badge-sm badge-warning">{children}</div>
}


// Edit/Save Button
const editNotesClass = "absolute top-0 right-0 z-20"
export function EditNotesButton({ isEdit, onClick, isFetching }) {
  if (isFetching) return <div className={editNotesClass+" py-1 px-2 sm:px-3 cursor-wait"}><LoadingSpinner size="1rem" /></div>
  return (
    <input
      value={isEdit ? "💾" : "🖊"} type="button" onClick={onClick}
      className={editNotesClass+" btn btn-ghost btn-xs sm:btn-sm"}
    />
  )
}