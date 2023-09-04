import React from "react"
import { ListRowStyle, ListNameStyle } from "../styles/EditableListStyles"
import { ListRowButton } from "../styles/EditableListButtons"

function ListRow({ onClick, name }) {
  return (
    <ListRowStyle>
      <ListRowButton disabled={!onClick} onClick={onClick} />
      <ListNameStyle isMissing={!name}>{name || "..."}</ListNameStyle>
    </ListRowStyle>
  )
}

export default ListRow