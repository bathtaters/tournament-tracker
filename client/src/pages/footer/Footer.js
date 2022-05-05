import React from "react"

import FooterStyle from "./FooterStyle"
import { footerText } from "../../assets/constants"

function Footer() {
  return (
    <FooterStyle>
      <div><p>{footerText}</p></div>
    </FooterStyle>
  )
}

export default Footer