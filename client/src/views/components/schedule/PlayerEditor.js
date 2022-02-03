import React, { useState, useEffect, useImperativeHandle, forwardRef, useCallback } from "react";
import PropTypes from 'prop-types';

import SuggestText from "../shared/SuggestText";

import { usePlayerQuery, useCreatePlayerMutation, } from "../../../queries/playerApi";

import { equalArrays, randomArray } from "../../../services/shared.services";
import { emptyNewPlayer, usePreviousArray, updateArrayWithChanges } from "../../../services/event.services";
import { 
  formatQueryError,
  createPlayerMsg,
  duplicatePlayerMsg,
  unsavedPlayerMsg,
  unaddedPlayerMsg
} from "../../../assets/strings";

const autofillSize = 8;

const PlayerEditor = forwardRef(function PlayerEditor({ players, status, onEdit }, ref) {
  // Init State
  const { data, isLoading, error } = usePlayerQuery();
  const [playerList, setPlayerList] = useState([]);
  const remainingPlayers = data ? Object.keys(data)
    .filter(p => !data[p].isteam && !playerList.includes(p)) : [];

  // Add Player to global players
  const [ createPlayer, { isLoading: playersUpdating } ] = useCreatePlayerMutation();
  const addNewPlayer = async playerInfo => {
    if (!window.confirm(createPlayerMsg(playerInfo.name))) return true;
    const id = await createPlayer(playerInfo).then(r => r.data.id);
    if (!id) throw new Error("Error adding player. ID was not returned upon creation: "+JSON.stringify(playerInfo));
    pushPlayer(id);
  };

  // Run onEdit when first edit is made
  const [isChanged, setChanged] = useState(false);
  const handleChange = useCallback(() => { 
    if (!isChanged) { onEdit(); setChanged(true); }
  }, [isChanged, setChanged, onEdit]);

  // Controller for SuggestText
  const [newPlayer, setNewPlayer] = useState(emptyNewPlayer);
  const newPlayerChange = e => e.target.value !== undefined ? 
    setNewPlayer({ ...newPlayer, name: e.target.value, id: e.target.id }):
    setNewPlayer({ ...newPlayer, id: e.target.id });

  // Push remote updates to local state
  const prevPlayers = usePreviousArray(players);
  useEffect(() => {
    if (!equalArrays(prevPlayers, players))
      setPlayerList(p => updateArrayWithChanges(prevPlayers, players || [], p));
  }, [prevPlayers, players, setPlayerList]);
  
  // Handle button click
  const clickAdd = (e, override) => {
    if (!newPlayer.visible) return setNewPlayer({ ...newPlayer, visible: true });

    let playerInfo = override || {...newPlayer};
    playerInfo.name = playerInfo.name.trim();
    if (!playerInfo.name) return setNewPlayer(emptyNewPlayer);

    handleChange();
    return pushPlayer(playerInfo.id);
  }

  // Automatically fill in up to 8 random players
  const autofill = () => setPlayerList(randomArray(remainingPlayers, autofillSize));

  // Add player to list (If valid)
  const pushPlayer = useCallback(playerid => {
    if (!playerid) throw new Error("Add player is missing playerid!");

    let res = true;
    if (playerList.includes(playerid)) {
      window.alert(duplicatePlayerMsg(data[playerid] && data[playerid].name));
      res = false;
    } else setPlayerList(playerList.concat(playerid));

    setNewPlayer(emptyNewPlayer);
    return res;
  },[data,playerList]);
  
  // Remove player from list
  const popPlayer = (pid, idx) => () => {
    const newList = playerList.slice();
    const rmvIdx = newList[idx] === pid ? idx : newList.lastIndexOf(pid);
    if (rmvIdx in newList) newList.splice(rmvIdx,1);
    setPlayerList(newList);
  };

  // Retrieve list for parent component
  const getList = useCallback(() => {
    let savedPlayers = playerList.slice();

    // Handle leftover text in player box
    if (newPlayer.visible && newPlayer.name.trim()) {
      if (newPlayer.id) {
        // Add player if they exist
        if (window.confirm(unsavedPlayerMsg(newPlayer.name)) && pushPlayer(newPlayer.id))
          savedPlayers.push(newPlayer.id);
        else return setNewPlayer(emptyNewPlayer);
        // Exit if player does not exist
      } else if (!window.confirm(unaddedPlayerMsg(newPlayer.name))) return; // Abort
    }
    
    setNewPlayer(emptyNewPlayer)
    return savedPlayers;
  },[playerList,newPlayer,pushPlayer]);
  useImperativeHandle(ref, () => ({ getList }), [getList]);


  // Render
  
  if (isLoading)
    return (<div className="m4"><h4>Players</h4><div className="font-light">...</div></div>);
  
  else if (error || !data)
    return (<div className="m4"><h4>Players</h4>
      <h3 className="font-light">{formatQueryError(error || "No player data found.")}</h3>
    </div>);

  const playerRow = (name, pid, idx) => (
    <div key={pid} className="min-w-48">
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
        <div className={playerList.length || newPlayer.visible ? null : "text-cente"}>
          <input
            className="my-1 mx-2 text-xs font-light px-0"
            type="button"
            value="+"
            onClick={clickAdd}
          />
          <input 
            className={
              "my-1 mx-8 w-24 text-sm font-light"
              + (playerList.length || newPlayer.visible ? " hidden" : "")
            }
            type="button"
            value={"Random "+autofillSize}
            onClick={autofill}
          />
          <SuggestText
            className="align-middle w-40"
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
  );
});

PlayerEditor.propTypes = {
  players: PropTypes.arrayOf(PropTypes.string),
  status: PropTypes.number,
  onEdit: PropTypes.func,
};

export default PlayerEditor;