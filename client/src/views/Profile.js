import React, { Fragment, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from "react-router-dom";

import { updatePlayer } from "../models/players";

// Default Picture
import {ReactComponent as ProfilePic} from "../assets/blank-user.svg";

// Component settings
const profileRows = [
  { title: 'Name', key: 'name', editable: true },
  { title: 'Record', key: 'record', formatString: r=>(r || []).join(' - ') },
]

// Main component
function Profile() {
  // Init values
  const { id } = useParams();
  const dispatch = useDispatch();

  // Global state
  const playerData = useSelector(state => state.players[id]);

  // Local state
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState(JSON.parse(JSON.stringify(playerData)));
  const changeData = key => e => setEditData({...editData, [key]: e.target.value});
  
  // Actions
  const updateData = key => {
    if (editData[key].trim()) dispatch(updatePlayer({ [key]: editData[key].trim(), id }));
    setEditing(false);
  };

  const handleClick = key => () => {
    // Begin edit
    if (editing !== key) {
      setEditData({...editData, [key]: playerData[key] });
      setEditing(key);

    // Save edit
    } else {
      updateData(key);
    }
  }

  return pug`
    div
      h3.font-thin User Profile
      .flex.flex-wrap
        div
          ProfilePic.w-36.h-40.alt-bgd.m-2.inline-block()
          .text-center.text-xs.italic.dim-color.font-light= 'id: ' + id

        div.flex-grow.flex-shrink.max-w-lg
          .grid.grid-flow-row.gap-x-2.gap-y-1.grid-cols-4.items-baseline.w-full
            each row in profileRows
              Fragment(key=row.key)
                h4.text-right.base-color.font-thin= row.title

                h4.base-color.col-span-2.w-full
                  if row.editable && editing === row.key
                    input(type="text" value=editData[row.key] onChange=changeData(row.key))
              
                  else
                    div= row.formatString ? row.formatString(playerData[row.key]) : playerData[row.key]
            
                if row.editable
                  .text-left.font-light.text-xs
                    a(onClick=handleClick(row.key))= editing === row.key ? 'save' : 'edit'

                    if editing === row.key
                      span= ' / '
                      a(onClick=(()=>setEditing(false)))= 'revert'
                
                else
                  div

      .mt-6
        p.font-light.dim-color.italic To add -- Player's past / current / future games
        p.font-thin.dim-color= JSON.stringify(playerData)
  `;
}

export default Profile;