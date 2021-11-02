import React, { useState, useRef, useCallback } from "react";
import PropTypes from 'prop-types';
import Modal from "./Components/Modal";
import Stats from "./Components/Stats";
import AddPlayer from "./Components/AddPlayer";

const deletePlayerMsg = name => "Are you sure you want to delete "+name+"? All of their info will be lost.";

function Players({ranking, players}) {
  const modal = useRef(null);
  const [data, setData] = useState(JSON.parse(JSON.stringify({ranking, players})));
  const [canDelete, setDeleteMode] = useState(false);

  const toggleDelete = () => setDeleteMode(!canDelete);

  const addPlayer = useCallback(playerInfo => {
    const playerId = newId(
      (playerInfo.name ? playerInfo.name.trim().charAt(0).toLowerCase() : 'x') + 'x',
      data.players
    );
    playerInfo.record = playerInfo.record || [0,0,0];
    setData({
      ranking: data.ranking.concat(playerId),
      players: { ...data.players, [playerId]: playerInfo },
    });
  }, [data]);

  const rmvPlayer = useCallback(playerId => {
    const rank = data.ranking.indexOf(playerId);
    if (rank < 0) return console.error('Could not find player '+playerId+' to remove.');

    const newRanking = data.ranking.slice(0,rank).concat(data.ranking.slice(rank+1))
    let newPlayers = {}; 
    Object.keys(data.players).forEach(pid => {
      if(pid !== playerId) newPlayers[pid] = data.players[pid];
    });
    setData({ ranking: newRanking, players: newPlayers });
  }, [data]);

  const handlePlayerClick = (playerId, e) => {
    if (!canDelete) return true;
    e.preventDefault();
    if (!window.confirm(deletePlayerMsg(data.players[playerId].name))) return false;
    rmvPlayer(playerId);
    return false;
  };

  return pug`
    div
      h2.font-thin.text-center.mb-6 Player Stats

      .px-6.flex.justify-center.mb-6
        Stats.border.neg-border.border-8(
          ranking=data.ranking
          players=data.players
          onPlayerClick=handlePlayerClick
          className=(!canDelete && "border-opacity-0")
          highlightClass=(canDelete ? "neg-bgd" : null)
        )

      h4.text-center
        input.m-2.p-lg(type="button" value="+" onClick=(()=>modal.current.open()) disabled=canDelete)
        input.m-2.p-lg(type="button" value=(canDelete ? "x" : "–") onClick=toggleDelete)
      
      Modal(ref=modal startLocked=true)
        AddPlayer(add=addPlayer hideModal=(force=>modal.current.close(force)))
  `;
}

Players.propTypes = {
  ranking: PropTypes.arrayOf(PropTypes.string),
  players: PropTypes.object,
};

export default Players;


const newId = (prefix, existing = null) => {
  if (!existing) existing = [];
  if (!Array.isArray(existing)) existing = Object.keys(existing);
  for (let i = 1; i < 100; i++) {
    if (!existing.includes(prefix+i))
      return prefix+i;
  }
  return null;
};
