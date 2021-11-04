import React, { useState, useRef, useCallback } from "react";
import { useDispatch } from 'react-redux';

import Modal from "./Components/Modal";
import Stats from "./Components/Stats";
import NewPlayer from "./Components/NewPlayer";

import { deletePlayerMsg } from "../assets/strings";
import { rmvPlayer } from "../models/players";

function Players() {
  // Init view
  const modal = useRef(null);
  const dispatch = useDispatch();

  // Local state
  const [canDelete, setDeleteMode] = useState(false);
  const toggleDelete = () => setDeleteMode(!canDelete);
  
  // Actions
  const handlePlayerClick = useCallback((playerId, e, playerData) => {
    if (!canDelete) return; // Pass click
    e.preventDefault();
    // Delete player
    if (!window.confirm(deletePlayerMsg(playerData.name))) return;
    dispatch(rmvPlayer(playerId));
  }, [canDelete, dispatch]);

  return pug`
    div
      h2.font-thin.text-center.mb-6 Player Stats

      .px-6.flex.justify-center.mb-6
        Stats.border.neg-border.border-8(
          onPlayerClick=handlePlayerClick
          className=(!canDelete && "border-opacity-0")
          highlightClass=(canDelete ? "neg-bgd" : "")
        )

      h4.text-center
        input.m-2.p-lg(type="button" value="+" onClick=(()=>modal.current.open()) disabled=canDelete)
        input.m-2.p-lg(type="button" value=(canDelete ? "x" : "–") onClick=toggleDelete)
      
      Modal(ref=modal startLocked=true)
        NewPlayer(hideModal=(force=>modal.current.close(force)))
  `;
}

export default Players;
