import React, { forwardRef } from "react"
import SuggestText from "../../SuggestText/SuggestText"
import { ListRowStyle, SuggestTextSpacer } from "../styles/EditableListStyles"
import { ListAddButton, ListFillButton } from "../styles/EditableListButtons"
import useListInputController from "../services/listInput.controller"

const ListInput = forwardRef(function ListInput(props, ref) {
  
  const { isHidden, suggestions, submitHandler, addButtonHandler } = useListInputController(props, ref)
  
  return (
    <ListRowStyle>

      <ListAddButton onClick={addButtonHandler} />
      { Boolean(props.autofill.onClick) &&
        <ListFillButton {...props.autofill} onFirstEdit={props.onFirstEdit} hidden={props.autofill.hidden || !isHidden} />
      }

      <SuggestText
        label={`next${props.type}`}
        placeholder={props.type}
        list={suggestions}
        isHidden={isHidden}
        onSubmit={submitHandler}
        hideStaticWhenEmpty={props.create.hideOnEmpty}
        ref={ref}
      />
      <SuggestTextSpacer />

    </ListRowStyle>
  );
});

export default ListInput;