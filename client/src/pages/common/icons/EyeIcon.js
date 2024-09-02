import React from "react"

/* Open: Public Domain -- https://www.svgrepo.com/svg/488933/eye-open */
/* Closed: Public Domain -- https://www.svgrepo.com/svg/488930/eye-closed */

function EyeIcon({ isOpen = true, className = "fill-none stroke-current w-full h-auto" }) {
    return isOpen ? (
        <svg className={className} version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M22 12.0002C20.2531 15.5764 15.8775 19 11.9998 19C8.12201 19 3.74646 15.5764 2 11.9998" />
            <path d="M22 12.0002C20.2531 8.42398 15.8782 5 12.0005 5C8.1227 5 3.74646 8.42314 2 11.9998" />
            <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" />
        </svg>
    ) : (
        <svg className={className} version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M21.0006 12.0007C19.2536 15.5766 15.8779 18 12 18M12 18C8.12204 18 4.7463 15.5766 2.99977 12.0002M12 
                18L12 21M19.4218 14.4218L21.4999 16.5M16.2304 16.9687L17.5 19.5M4.57812 14.4218L2.5 16.5M7.76953 16.9687L6.5 19.5"
            />
        </svg>
    )
}

export default EyeIcon
