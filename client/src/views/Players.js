import React, { useState, useRef, useCallback } from "react";

import Modal from "./Components/Modal";
import Stats from "./Components/Stats";
import NewPlayer from "./Components/AddPlayer";

import { deletePlayerMsg, cantDeletePlayerMsg } from "../assets/strings";

import { useSettingsQuery } from "../models/baseApi";
import { useDeletePlayerMutation } from "../models/playerApi";

function Players() {
  // Init view
  const modal = useRef(null);
  const { data: settings } = useSettingsQuery();
  const [ deletePlayer ] = useDeletePlayerMutation();

  // Local state
  const [canDelete, setDeleteMode] = useState(false);
  const toggleDelete = () => setDeleteMode(!canDelete);
  
  // Actions
  const handlePlayerClick = useCallback((playerId, e, playerData) => {
    if (!canDelete) return; // Pass click
    e.preventDefault();
    // Check player can be deleted
    if (playerData.draftIds && playerData.draftIds.length)
      return window.alert(cantDeletePlayerMsg(playerData.name));
    // Delete player
    if (!window.confirm(deletePlayerMsg(playerData.name))) return;
    deletePlayer(playerId);
  }, [canDelete, deletePlayer]);

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
        if settings && settings.showadvanced
          input.m-2.p-lg(type="button" value=(canDelete ? "x" : "–") onClick=toggleDelete)
      
      Modal(ref=modal)
        NewPlayer(
          hideModal=(force=>modal.current.close(force))
          lockModal=(()=>modal.current.lock())
        )
  `;
}

export default Players;
