import React, { Fragment } from "react";
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { useForm } from "react-hook-form";

import { addPlayer } from "../../models/players";

// Compenent settings
const settingsRows = [
  { title: 'Name', key: 'name', def: "New Player" },
];

// Component
function AddPlayer({ hideModal }) {
  const dispatch = useDispatch();
  const { register, handleSubmit } = useForm();

  const submitPlayer = playerData => {
    // Apply defaults
    settingsRows.forEach(r => {
      if (
        r.key in playerData &&
        !(playerData[r.key].trim ? playerData[r.key].trim() : playerData[r.key]) &&
        r.def
      ) playerData[r.key] = r.def;
    });
    // Add player
    dispatch(addPlayer(playerData));
    hideModal(true);
  };

  const settingsToRow = row => (
    <Fragment key={row.key}>
      <div className="m-4 text-center">
        <h4>
          <label className="mr-2 w-max">{row.title}</label>
          <input
            className="max-color pt-1 px-2"
            type="text"
            {...register(row.key)}
          />
        </h4>
      </div>
    </Fragment>
  );

  return (
    <div>
      <h3 className="font-light.max-color.text-center.mb-4">Add Player</h3>
      <form onSubmit={handleSubmit(submitPlayer)}>
        <div className="flex flex-col flex-wrap-reverse">
          {settingsRows.map(settingsToRow)}
        </div>
        <div className="text-center mt-4">
          <input
            className="font-light dim-color w-14 h-8 mx-1 sm:w-20 sm:h-11 sm:mx-4"
            type="submit"
            value="Create"
          />
          <input
            className="font-light dim-color w-14 h-8 mx-1 sm:w-20 sm:h-11 sm:mx-4"
            type="button"
            value="Cancel"
            onClick={()=>hideModal(true)}
          />
        </div>
      </form>
    </div>
  );
}

AddPlayer.propTypes = {
  hideModal: PropTypes.func,
};

export default AddPlayer;