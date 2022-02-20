import React from 'react';

export function PageTitleStyle({ className = "", children }) {
  return <h2 className={`text-center font-thin ${className}`}>{children}</h2>
}

export function ModalTitleStyle({ className = "", children }) {
  return (<h3 className={`font-light max-color text-center mb-3 ${className}`}>{children}</h3>)
}
