import { SuggestText } from "../../SuggestText/SuggestText"
import { ListRowStyle, SuggestTextSpacer } from "../styles/EditableListStyles"
import { ListAddButton, ListFillButton } from "../styles/EditableListButtons"
import useListInputController from "../services/listInput.controller"

export default function ListInput(props) {
  
  const { backend, isHidden, addButtonHandler } = useListInputController(props)
  
  return (
    <ListRowStyle>

      <ListAddButton onClick={addButtonHandler} />
      { Boolean(props.autofill.onClick) &&
        <ListFillButton {...props.autofill} onFirstEdit={props.onFirstEdit} hidden={props.autofill.hidden || !isHidden} />
      }

      <SuggestText
        backend={backend}
        label={`next${props.type}`}
        placeholder={props.type}
      />
      <SuggestTextSpacer />

    </ListRowStyle>
  )
}
