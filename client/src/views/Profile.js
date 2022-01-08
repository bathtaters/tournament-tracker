import React, { Fragment, useState } from "react";
import { useParams } from "react-router-dom";

import PlayerDrafts from "./Components/PlayerDrafts";
import RawData from "./Components/RawData";

import { usePlayerQuery, useUpdatePlayerMutation } from "../models/playerApi";

import { formatQueryError } from "../assets/strings";

// Default Picture
import {ReactComponent as ProfilePic} from "../assets/blank-user.svg";

// Component layout
const profileRows = [
  { title: 'Name', key: 'name', editable: true },
  // { title: 'Record', key: 'record', formatString: r=>(r || []).join(' - ') },
]

// Main component
function Profile() {
  // Init values
  const { id } = useParams();

  // Global state
  const { data: playerData, isLoading, error } = usePlayerQuery();
  const data = playerData && playerData[id];

  // Local state
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const changeData = key => e => setEditData({...editData, [key]: e.target.value});
  
  // Actions
  const [ updatePlayer ] = useUpdatePlayerMutation();
  const updateData = key => {
    if (editData[key].trim()) updatePlayer({ [key]: editData[key].trim(), id });
    setEditing(false);
  };

  const handleClick = key => () => {
    // Begin edit
    if (editing !== key) {
      setEditData({...editData, [key]: data[key] });
      setEditing(key);

    // Save edit
    } else {
      updateData(key);
    }
  }

  const tableRow = row => (
    <Fragment key={row.key}>
      <h4 className="text-right base-color font-thin">{row.title}</h4>
      <h4 className="base-color col-span-2 w-full">
        { row.editable && editing === row.key ?
          <input onChange={changeData(row.key)} type="text" value={editData[row.key]} />
        :
          <div>{row.formatString ? row.formatString(data[row.key]) : data[row.key]}</div>
        }
      </h4>
      { row.editable ?
        <div className="text-left font-light text-xs">
          <span className="link" onClick={handleClick(row.key)}>
            {editing === row.key ? 'save' : 'edit'}
          </span>

          { editing === row.key ? <>
            <span>{' / '}</span>
            <span className="link" onClick={()=>setEditing(false)}>
              cancel
            </span>

          </> : null }
        </div>
      : 
        <div />
      }
    </Fragment>
  );

  return (
    <div>
      <h3 className="font-thin">User Profile</h3>
      { isLoading ?
        <h4 className="base-color font-thin">Loading...</h4>
      : error ?
        <h4 className="base-color font-thin italic">{formatQueryError(error)}</h4>
      :
        <div className="flex flex-wrap">
          <div>
            <ProfilePic className="w-36 h-40 alt-bgd m-2 inline-block" />
          </div>
          <div className="grow shrink max-w-lg">
            <div className="grid grid-flow-row gap-x-2 gap-y-1 grid-cols-4 items-baseline w-full">
              {profileRows.map(tableRow)}
            </div>
          </div>
        </div>
      }

      <RawData data={data} />
      
      <PlayerDrafts id={id} />
    </div>
  );
}

export default Profile;