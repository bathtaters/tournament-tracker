import React, { Fragment, useState } from "react";
import { useParams } from "react-router-dom";
import {ReactComponent as ProfilePic} from "../assets/blank-user.svg";
import PropTypes from 'prop-types';

const profileRows = [
  { title: 'Name', key: 'name', editable: true, toString: r=>r },
  { title: 'Record', key: 'record', toString: r=>r.join(' - ') },
]

function Profile({ data }) {
  const { id } = useParams();
  const [playerData, setPlayerData] = useState(JSON.parse(JSON.stringify(data[id])));
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState(JSON.parse(JSON.stringify(data[id])));

  const updateData = key => {
    setPlayerData({ ...playerData, [key]: editData[key].trim() || playerData[key] });
    setEditing(null);
  };

  const changeData = key => e => setEditData({...editData, [key]: e.target.value});

  const handleClick = key => () => {
    if (editing !== key) {
      setEditData({...editData, [key]: playerData[key] });
      setEditing(key);
    } else {
      updateData(key);
      setEditing(false);
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
                    div= row.toString ? row.toString(playerData[row.key]) : playerData[row.key]
            
                if row.editable
                  a.text-left.font-light.text-xs(onClick=handleClick(row.key))= editing === row.key ? 'save' : 'edit'
                
                else
                  div

      .mt-6 To add -- Player's past / current / future games
  `;
}

Profile.propTypes = {
  data: PropTypes.object,
};

export default Profile;