import React from "react"

function MenuIcon({ className, tab = '0', isOpen = false }) {
  return (
    <label tabIndex={tab} className={`${className} swap swap-rotate ${isOpen ? 'swap-active' : ''}`}>
      {/* hamburger icon */}
      <svg className="swap-off fill-current w-6 h-6 sm:w-8 sm:h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path d="M64,384H448V341.33H64Zm0-106.67H448V234.67H64ZM64,128v42.67H448V128Z" />
      </svg>

      {/* close icon */}
      <svg className="swap-on fill-current w-6 h-6 sm:w-8 sm:h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <polygon points="400 145.49 366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49" />
      </svg>
    </label>
  )
}

export default MenuIcon