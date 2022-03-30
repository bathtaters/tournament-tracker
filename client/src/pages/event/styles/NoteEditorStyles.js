import React from "react"
import LoadingSpinner from "../../common/components/LoadingSpinner"
import { useScaleToFitRef } from "../../common/common.hooks"

// Wrapper
export const NotesWrapperStyle = React.forwardRef(function NotesWrapperStyle({ children }, ref) {
  return <div className="text-center relative my-2 mx-10" ref={ref}>{children}</div>
})

// Main Component
export function NotesStyle(props) {
  const ref = useScaleToFitRef([props.value], { padding: 2 })
  return (
    <textarea
      className="font-light text-xs sm:text-sm text-left p-px px-2 resize-none w-full border border-opacity-100"
      ref={ref} {...props}
    />
  )
}

// Wrapper Overlay
export function NotesOverlayStyle({ visible, onClick, children }) {
  if (!visible) return null
  return (
    <div className="absolute top-0 bottom-0 left-0 right-0 flex" onClick={onClick}>
      <div className="m-auto pb-1 dim-color italic font-thin cursor-pointer">{children}</div>
    </div>
  )
}

// Character Counter
export function CharCountStyle({ visible, children }) {
  if (!visible) return null
  return <div className="dim-color absolute bottom-2 right-1 text-right text-xs font-thin base-bgd bg-opacity-70">{children}</div>
}


// Edit/Save Button
export function EditNotesButton({ isEdit, onClick, isFetching }) {
  return (
    <div className={"absolute top-0 right-1 p-1 cursor-"+(isFetching ? "wait" : "pointer")} onClick={isFetching ? undefined : onClick}>
      {isFetching ? <LoadingSpinner /> : isEdit ? '💾' : "🖊"}
    </div>
  )
}