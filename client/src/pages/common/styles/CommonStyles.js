import React from 'react';

export function AppWrapperStyle({ children }) {
  return (<div className="min-h-screen relative">{children}</div>);
}

export function PageWrapperStyle({ children }) {
  return (<div className="m-auto p-4 max-w-3xl">{children}</div>);
}

export function PageTitleStyle({ className = "", children }) {
  return <h2 className={`text-center font-thin ${className}`}>{children}</h2>
}

export function ModalTitleStyle({ className = "", children }) {
  return (<h3 className={`font-light text-center mb-3 ${className}`}>{children}</h3>)
}
