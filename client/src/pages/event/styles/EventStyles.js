import React from "react";

export function TitleStyle({ children }) {
  return <h2 className="text-center font-thin">{children}</h2>
}

export function RoundButtonStyle({ children }) {
  return (
    <div className="text-center my-4">{children}</div>
  );
}

export function DashboardStyle({ children }) {
  return (
    <div className="flex flex-row flex-wrap justify-evenly">
      {children}
    </div>
  )
}

export function RoundStyle({ title, isMissing, className='', children }) {
  return (
    <div className={'m-4 relative ' + className}>

      <h3 className="font-light text-center">{title}</h3>

      <div className="flex flex-col">{
        !isMissing ? children : (
          <div className="dim-color text-center font-thin italic">Missing</div>
        )
      }</div>

    </div>
  );
}

export function EditRoundStyle({ children }) {
  return (<div className="font-thin text-sm italic text-center mt-1">{children}</div>);
}

// Dashboard Styles
export const DashContainerStyle = ({ children }) => (<div className="text-center font-light">{children}</div>);
export const DashStatusStyle = ({ children }) => (<h4 className="font-thin max-color">{children}</h4>);
export const DashDetailStyle = ({ children }) => (<h5 className="pt-0 italic dim-color">{children}</h5>);
export const DashButtonStyle = ({ children }) => (<div className="text-center my-6">{children}</div>);

export const dashText = {
  base: "mr-2",
  dynamic: "sm:text-2xl",
  both: () => dashText.base + ' ' +dashText.dynamic
};