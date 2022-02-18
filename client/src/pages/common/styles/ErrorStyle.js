import React from "react";

export default function ErrorStyle({ title, children }) {
  return (
    <div className="text-center">
      <h4>{title}</h4>
      <details className="whitespace-pre-wrap">
        {children}
      </details>
    </div>
  );
}