import React from "react"

function MenuIcon({ className }) {
  return (
    <label tabIndex="0" className={className}>
      <svg className="fill-current w-6 h-6 sm:w-8 sm:h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path d="M64,384H448V341.33H64Zm0-106.67H448V234.67H64ZM64,128v42.67H448V128Z" />
      </svg>
    </label>
  )
}

export default MenuIcon