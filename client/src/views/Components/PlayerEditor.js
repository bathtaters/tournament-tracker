import React, { useEffect } from "react";
import PropTypes from 'prop-types';

import SuggestText from "./SuggestText";

import { usePlayerQuery, useCreatePlayerMutation, } from "../../models/playerApi";

import { formatQueryError, createPlayerMsg, duplicatePlayerMsg, } from "../../assets/strings";
import { equalArrays } from "../../controllers/misc";
import { emptyNewPlayer, usePreviousArray, updateArrayWithChanges } from "../../controllers/draftHelpers";


function PlayerEditor({ players, status, newPlayer, setNewPlayer, playerList, setPlayerList }) {
  // Global State
  const { data, isLoading, error } = usePlayerQuery();
  const remainingPlayers = data ? Object.keys(data).filter(p=>!playerList.includes(p)) : [];

  // Global Actions
  const [ createPlayer, { isLoading: playersUpdating } ] = useCreatePlayerMutation();
  const addNewPlayer = async playerInfo => {
    if (!window.confirm(createPlayerMsg(playerInfo.name))) return true;
    const id = await createPlayer(playerInfo).then(r => r.data.id);
    if (!id) throw new Error("Error adding player. ID was not returned upon creation: "+JSON.stringify(playerInfo));
    pushPlayer(id);
  };

  // Controlled component method for SuggestText
  const newPlayerChange = e => e.target.value !== undefined ? 
    setNewPlayer({ ...newPlayer, name: e.target.value, id: e.target.id }):
    setNewPlayer({ ...newPlayer, id: e.target.id });

  // For concurrent write-while-editing
  const prevPlayers = usePreviousArray(players);
  useEffect(() => {
    if (!equalArrays(prevPlayers, players))
      setPlayerList(updateArrayWithChanges(prevPlayers, players || [], playerList));
  }, [prevPlayers, players, playerList, setPlayerList]);
  
  // Local handlers
  const clickAdd = (e, override) => {
    if (!newPlayer.visible) return setNewPlayer({ ...newPlayer, visible: true });

    let playerInfo = override || {...newPlayer};
    playerInfo.name = playerInfo.name.trim();
    if (!playerInfo.name) return setNewPlayer(emptyNewPlayer);

    pushPlayer(playerInfo.id);
  }

  const pushPlayer = playerId => {
    if (!playerId) throw new Error("Add player is missing playerId!");

    if (playerList.includes(playerId))
      window.alert(duplicatePlayerMsg(data[playerId] && data[playerId].name));
    else
      setPlayerList(playerList.concat(playerId));

    setNewPlayer(emptyNewPlayer);
  }
  
  const popPlayer = (pid, idx) => () => {
    const newList = playerList.slice();
    const rmvIdx = newList[idx] === pid ? idx : newList.lastIndexOf(pid);
    if (rmvIdx in newList) newList.splice(rmvIdx,1);
    setPlayerList(newList);
  };

  // Render
  
  if (isLoading)
    return (<div className="m4"><h4>Players</h4><div className="font-light">...</div></div>);
  
  else if (error || !data)
    return (<div className="m4"><h4>Players</h4>
      <h3 className="font-light">{formatQueryError(error || "No player data found.")}</h3>
    </div>);

  const playerRow = (name, pid, idx) => (
    <div key={pid} className="min-w-40">
      {status < 2 ? <input
        className="my-1 mx-2 text-xs font-light px-0"
        type="button"
        value="–"
        onClick={popPlayer(pid, idx)}
      /> :
      <span className="mx-1">•</span>
      }
      <span className={"align-middle"+(!name ? " italic dim-color" : "")}>
        {name || (playersUpdating ? "..." : "Missing")}
      </span>
    </div>
  );

  return (
    <div className="m-4">
      <h4>{`Players (${playerList.length})`}</h4>
      {playerList.map((pid,idx) => playerRow(data[pid] && data[pid].name, pid, idx))}
      {status < 2 ? 
        <div>
          <input
            className="my-1 mx-2 text-xs font-light px-0"
            type="button"
            value="+"
            onClick={clickAdd}
          />
          <SuggestText
            className="align-middle"
            isHidden={!newPlayer.visible}
            value={newPlayer.name}
            onChange={newPlayerChange}
            onEnter={clickAdd}
            onStaticSelect={name => addNewPlayer({ name })}
            suggestionList={remainingPlayers.map(id=>({id, name: data[id].name}))}
            staticList={["Add Player"]}
          />
          <span className="align-middle"></span>
        </div>
      : null}
    </div>
  )
}

PlayerEditor.propTypes = {
  players: PropTypes.arrayOf(PropTypes.string),
  status: PropTypes.number,
  playerList: PropTypes.arrayOf(PropTypes.string),
  setPlayerList: PropTypes.func,
  newPlayer: PropTypes.object,
  setNewPlayer: PropTypes.func,
};

export default PlayerEditor;