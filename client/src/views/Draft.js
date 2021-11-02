import React, { useState } from "react";
import { useParams } from "react-router-dom";
import PropTypes from 'prop-types';
import DraftStats from "./Components/DraftStats";
import Round from "./Components/Round";

const newDraft = (id, players) => ({
  id, draws: 0, reported: false,
  players: players.reduce((p,pid)=>({...p, [pid]: 0}),{}),
});

const newRound = (playerIds, draftId, roundNum) => {
  let round = [];
  const e = Math.ceil(playerIds.length / 2);
  for (let i = 0; i < e; i++) {
    round.push(newDraft(draftId+'m'+roundNum+(i+1), playerIds.slice(i * 2, i * 2 + 2)));
  }
  return round;
};

function Draft({ drafts, players }) {
  let { id } = useParams();
  const [matches, setMatches] = useState(drafts[id] && drafts[id].matches ? JSON.parse(JSON.stringify(drafts[id].matches)) : []);
  const [activePlayers, setPlayers] = useState(drafts[id] && drafts[id].ranking ? JSON.parse(JSON.stringify(drafts[id].ranking)): []);
  const ranking = drafts[id].ranking;

  const popRound = () => setMatches(matches.slice(0,-1));

  const pushRound = () => setMatches(matches.concat([newRound(activePlayers, id, matches.length + 1)]));

  const setRound = roundNum => roundData => setMatches(
    roundData ?
    Object.assign([], matches, {[roundNum]: roundData}) :
    drafts[id] ? JSON.parse(JSON.stringify(drafts[id].matches)) : []
  );
  
  const changeActive = (playerIds, drop) => drop ? 
    setPlayers(activePlayers.filter(p => !playerIds.includes(p))) :
    setPlayers(activePlayers.concat(playerIds.filter(p => !activePlayers.includes(p))));

  const isDone = roundNum => !matches.length || (matches[--roundNum] && matches[roundNum].every(m => m.reported));
  
  return pug`
    div
      if drafts[id]
        h2.text-center.font-thin= drafts[id].title

        form.text-center.mt-6.mb-4
          input(type="button" value="Next Round" disabled=!isDone(matches.length) onClick=pushRound)

        .flex.flex-row.flex-wrap.justify-evenly
          if ranking && ranking.length
            DraftStats(title=drafts[id].title ranking=ranking players=players active=activePlayers)

          - var roundCount = matches.length - 1

          - var roundNum = roundCount + 1

          while roundNum-- > 0
            Round(
              roundNum=(roundNum + 1)
              matches=matches[roundNum]
              setMatches=setRound(roundNum)
              changeActive=changeActive
              deleteRound=(roundNum === roundCount ? popRound : null)
              players=players
              key=(id+"."+roundNum)
            )
      
      else
        h3.italic.text-center.font-thin Draft not found
  `;
}

Draft.propTypes = {
  drafts: PropTypes.object,
  players: PropTypes.object,
};

export default Draft;