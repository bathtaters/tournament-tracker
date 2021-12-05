import React, { useState } from "react";
import PropTypes from 'prop-types';

import Match from './Match';

import { useDraftQuery, } from "../../models/draftApi";


function Round({ draftId, round, deleteRound }) {
  // Global
  const { data, isLoading, error } = useDraftQuery(draftId);

  // Local
  const [isEditing, setEditing] = useState(false);

  return pug`
    .m-4.relative(className=(isEditing ? "z-40" : ""))
      h3.font-light.text-center= 'Round '+(round+1)
      .flex.flex-col
        if isLoading || error || !data.matches[round]
          .dim-color.text-center.font-thin.italic= isLoading ? '...' : error ? JSON.stringify(error) : 'Missing'

        else
          each match, idx in data.matches[round]
            Match(
              key=match.id
              data=match
              draftId=draftId
              isEditing=isEditing
              activePlayers=data.players
            )

          .font-thin.text-sm.italic.text-center.mt-1
            if isEditing
              a(onClick=(()=>setEditing(false))) Back
              if deleteRound
                span.mx-1 /
                a(onClick=deleteRound) Delete

            else
              a(onClick=(()=>setEditing(true)))= 'Edit Round '+(round+1)
              
    if isEditing
      .fixed.top-0.left-0.w-screen.h-screen.z-30.base-bgd.bg-opacity-50
  `;
}

Round.propTypes = {
  draftId: PropTypes.string.isRequired,
  round: PropTypes.number.isRequired,
  deleteRound: PropTypes.func,
};

export default Round;