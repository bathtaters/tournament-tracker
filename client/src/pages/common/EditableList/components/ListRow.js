import React from "react"
import { ListRowStyle, ListNameStyle } from "../styles/EditableListStyles"
import { ListRowButton } from "../styles/EditableListButtons"

function ListRow({ name, onClick, onClickName }) {
  return (
    <ListRowStyle>
      <ListRowButton disabled={!onClick} onClick={onClick} />
      <ListNameStyle isMissing={!name} onClick={onClickName}>{name || "..."}</ListNameStyle>
    </ListRowStyle>
  )
}

export default ListRow