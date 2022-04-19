import React from "react";

function EditRound({ roundNum, isEditing, showAdvanced, setEditing, deleteRound }) {
  // Editing Round
  if (isEditing) return (<>
    <span className="link link-hover link-secondary" onClick={()=>setEditing(false)}>Back</span>
    
    { deleteRound && <>
      <span className="mx-1">/</span>
      <span className="link link-hover link-secondary" onClick={deleteRound}>Delete</span>
    </> }

  </>); 

  // Edit Round Button
  if (showAdvanced) return (
    <span className="link link-hover link-secondary" onClick={()=>setEditing(true)}>
      {'Edit Round '+(roundNum+1)}
    </span>
  );

  // Neither
  return null;
}

export default EditRound;