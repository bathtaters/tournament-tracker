import React from "react";
import PropTypes from 'prop-types';
import Loading from "../Loading";
import ListRow from "./components/ListRow";
import ListInput from "./components/ListInput";
import { EditableListStyle } from "./styles/EditableListStyles";
import useEditableListController from "./services/editableList.controller";


function EditableList({
  type = 'Item',
  value,
  onChange,
  query,
  autofill = { onClick: null, label: 'Autofill' },
  create = { mutation: null, label: 'Add', hideOnEmpty: false },
  onClick = null,
  isLocked = false,
  onFirstChange = null,
  filter = null,
  idKey = 'id',
  nameKey = 'name',
}) {

  const {
    data, inputData, popItem, isLoading, error
  } = useEditableListController({ type, value, onChange, query, idKey, nameKey, filter, autofill, isLocked, onFirstChange })


  // Loading/Error catcher
  if (!data) return (
    <EditableListStyle type={type}><Loading loading={isLoading} error={error} altMsg={`${type} data not found`} /></EditableListStyle>
  )

  return (
    <EditableListStyle type={type} count={value?.length}>

      { value?.map((id,idx) => 
        <ListRow
          name={data[id]?.[nameKey]}
          onClick={!isLocked && popItem(id, idx)}
          onClickName={onClick && onClick(id,idx)}
          key={id}
        />
      ) }

      { !isLocked && <ListInput {...inputData} create={create} /> }
      
    </EditableListStyle>
  )
}

EditableList.propTypes = {
  type: PropTypes.string,
  value: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  query: PropTypes.object,
  autofill: PropTypes.object,
  create: PropTypes.object,
  onClick: PropTypes.func,
  isLocked: PropTypes.bool,
  onFirstChange: PropTypes.func,
  filter: PropTypes.func,
  idKey: PropTypes.string,
  nameKey: PropTypes.string,
}

export default EditableList