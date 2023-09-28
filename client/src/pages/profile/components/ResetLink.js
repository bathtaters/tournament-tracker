import React from "react"
import { LinkWrapperStyle, LoadingLinkStyle, ResetLinkStyle } from "../styles/ProfileStyles"
import { LOADING } from "../services/profileFetch.services"
import { resetLink } from "../services/profile.services"

function ResetLink({ link }) {
  if (!link) return null

  if (link === LOADING)
    return <LinkWrapperStyle><LoadingLinkStyle /></LinkWrapperStyle>

  return (
    <LinkWrapperStyle>
      <ResetLinkStyle href={resetLink(link)} />
    </LinkWrapperStyle>
  )
}

export default ResetLink