import React, { useLayoutEffect } from "react";

export function WrapperStyle({ children }) {
  return (<span className="inline-block relative p-1">{children}</span>);
}

export const ListStyle = React.forwardRef(function ListStyle({ textbox, children }, ref) {
  // Set width of list based on width of textbox
  useLayoutEffect(() => {
    ref.current.style.width = textbox.current?.offsetWidth ? (textbox.current.offsetWidth-2)+'px' : 'inherit'
    ref.current.style.marginLeft = '1px' // offset for rounded edges
  }, [textbox.current?.offsetWidth])

  return (
    <div className="absolute z-50 top-auto max-h-screen">
      <div className="fixed border dim-border shadow-lg max-h-32 overflow-y-auto overflow-x-hidden" ref={ref}>
        <ul>{children}</ul>
      </div>
    </div>
  );
});

export function EntryStyle({ className, isSelected, children }) {
  const selectClass = isSelected ? " base-bgd-inv base-color-inv" : "";

  return (
  <li className={"base-bgd dim-color py-0.5 px-2 w-full break-words line-clamp-1 " + className + selectClass}>
    {children}
  </li>
  );
}