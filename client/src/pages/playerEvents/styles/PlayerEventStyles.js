import React from "react"
import { ModalTitleStyle } from "../../common/styles/CommonStyles"

export const tableHdrStyle = "text-left text-xl"

export function WrapperStyle({ children }) {
  return (
    <div className="my-8">
      {children}
    </div>
  )
}

export const HeaderStyle = ({ children }) => <ModalTitleStyle>{children}</ModalTitleStyle>