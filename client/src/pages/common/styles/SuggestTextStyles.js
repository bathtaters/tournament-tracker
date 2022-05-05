import React, { useLayoutEffect } from "react";

export function WrapperStyle({ children }) {
  return (<span className="inline-block relative p-1">{children}</span>);
}

export const ListStyle = React.forwardRef(function ListStyle({ textbox, children }, ref) {
  // Set width of list based on width of textbox
  useLayoutEffect(() => {
    ref.current.style.width = textbox.current?.offsetWidth ? (textbox.current.offsetWidth-8)+'px' : 'inherit'
    ref.current.style.marginLeft = '4px' // offset for rounded edges
  }, [textbox.current?.offsetWidth])

  return (
    <div className="absolute z-auto top-auto max-h-screen">
      <div className="fixed border border-base-300 shadow-neutral shadow-md max-h-32 overflow-y-auto overflow-x-hidden" ref={ref}>
        <ul>{children}</ul>
      </div>
    </div>
  );
});

export function EntryStyle({ className, isSelected, children }) {
  const selectClass = isSelected ? " bg-primary text-primary-content" : " bg-base-100 text-base-content";

  return (
  <li className={"py-0.5 px-2 w-full break-words line-clamp-1 cursor-default " + className + selectClass}>
    {children}
  </li>
  );
}