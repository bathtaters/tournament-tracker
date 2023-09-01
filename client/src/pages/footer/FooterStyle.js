import React from "react"

function FooterStyle({ children }) {
  return (
    <footer className="footer footer-center p-4 mt-4 bg-neutral text-neutral-content font-thin max-w-3xl">
      {children}
    </footer>
  )
}

export default FooterStyle