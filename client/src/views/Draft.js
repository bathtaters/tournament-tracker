import React from "react";
import { useParams } from "react-router-dom";
import PropTypes from 'prop-types';
import DraftStats from "./Components/DraftStats";
import Round from "./Components/Round";

function Draft({ drafts, players }) {
  let { id } = useParams();
  return pug`
    div
      if drafts[id]
        h2.text-center.font-thin= drafts[id].title

        form.text-center.mt-6.mb-4
          input(type="button" value="Next Round" disabled=true)

        .flex.flex-row.flex-wrap.justify-evenly
          if drafts[id].ranking && drafts[id].ranking.length
            DraftStats(title=drafts[id].title ranking=drafts[id].ranking players=players)

          - var roundNum = (drafts[id].matches || []).length
          while --roundNum >= 0
            Round(roundNum=(roundNum + 1) matches=drafts[id].matches[roundNum] players=players key=id+"."+roundNum)

      else
        h3.italic.text-center.font-thin Draft not found
  `;
}

Draft.propTypes = {
  drafts: PropTypes.object,
  players: PropTypes.object,
};

export default Draft;