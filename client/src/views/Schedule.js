import React, { useState, useRef, useCallback } from "react";
import PropTypes from 'prop-types';
import Modal from "./Components/Modal";
import Day from './Components/Day';
import EditDraft from './Components/EditDraft';

import getDays, { sameDay } from '../controllers/getDays';
import { swapData } from '../controllers/swapData';

function Schedule({ schedule, range, drafts, players }) {
  const modal = useRef(null);
  const [draftData, setDrafts] = useState(JSON.parse(JSON.stringify(drafts)));
  const [playerData, setPlayers] = useState(JSON.parse(JSON.stringify(players)));
  const [scheduleData, setSchedule] = useState(getDays(range, schedule));
  const [isEditing, setEdit] = useState(false);
  const [currentDraft, setCurrentDraft] = useState(null);

  const openDraftModal = useCallback(draftId => { setCurrentDraft(draftId); modal.current.open(); }, [modal]);

  const resetSchedule = useCallback(() => { setSchedule(getDays(range, schedule)); setEdit(false); }, [range,schedule]);

  const swapDrafts = useCallback((draftA, draftB) => {
    if (draftA.id === draftB.id ||
      (!draftB.id && sameDay(draftA.day, draftB.day))) return;
    setSchedule(swapData(
      scheduleData, 'drafts', 'day', draftA, draftB, 'id',
      (a,b) => a ? sameDay(a,b) : a===b
    ));
  }, [scheduleData]);

  const editDraft = draftId => (draftSettings, newPlayers=null) => {
    // Update new player names to playerIds
    if (newPlayers && newPlayers.length) {
      const newPlayerData = getPlayers(newPlayers, playerData);
      draftSettings.ranking = updateArray(draftSettings.ranking, flipObject(newPlayers, newPlayerData, 'name'));
      setPlayers(newPlayerData);
    }
    // Create new draft & add to "Unscheduled"
    let updateSched;
    if (!draftId) {
      draftId = newId('d', draftData);
      updateSched = [
        scheduleData[0].day ?
          { day: null, drafts: [draftId] } :
          { ...scheduleData[0], drafts: scheduleData[0].drafts.concat(draftId)},
        ...scheduleData.slice(scheduleData[0].day ? 0 : 1)
      ];
    }
    // Add draft & close modal
    setDrafts({ ...draftData, [draftId]: draftSettings });
    if (updateSched) setSchedule(updateSched);
    modal.current.close(true);
  };

  return pug`
    div
      .flex.justify-evenly.items-center
        input.font-light.dim-color.w-14.h-8(
          className="sm:w-20 sm:h-11"
          type="button"
          value=(isEditing ? "Revert" : "+")
          onClick=(isEditing ? resetSchedule : ()=>openDraftModal())
        )
        
        h2.inline-block.text-center.font-thin Schedule
        
        input.font-light.dim-color.w-14.h-8(
          className="sm:w-20 sm:h-11"
          type="button"
          value=(isEditing ? "Save" : "Edit")
          onClick=(()=>setEdit(!isEditing))
        )

      .flex.flex-wrap.justify-center.mt-4
        each dayBlock in scheduleData
          Day(
            data=dayBlock
            drafts=draftData
            isEditing=isEditing
            swapDrafts=swapDrafts
            setDraftModal=openDraftModal
            key=(dayBlock.day ? dayBlock.day.toISOString() : 'NULL')
          )
      
      Modal(ref=modal, startLocked=true)
        EditDraft(
          draft=draftData[currentDraft]
          players=playerData
          editDraft=editDraft(currentDraft)
          hideModal=(force=>modal.current.close(force))
        )
  `;
}

Schedule.propTypes = {
  schedule: PropTypes.arrayOf(PropTypes.object),
  range: PropTypes.arrayOf(PropTypes.object),
  drafts: PropTypes.object,
  players: PropTypes.object,
};

export default Schedule;

const flipObject = (keyArray, obj, matchOn=null) => keyArray.reduce((res,key) => {
  res[key] = Object.keys(obj).find(k => (matchOn ? obj[k][matchOn] : obj[k]) === key);
  return res;
}, {});
const updateArray = (arr,dict) => arr.map(entry => dict[entry] || entry);

const newId = (prefix, existing = null) => {
  if (!existing) existing = [];
  if (!Array.isArray(existing)) existing = Object.keys(existing);
  for (let i = 1; i < 100; i++) {
    if (!existing.includes(prefix+i))
      return prefix+i;
  }
  return null;
}

const getPlayer = (playerInfo,existingPlayers) => {
  const playerId = newId(
    (playerInfo.name ? playerInfo.name.trim().charAt(0).toLowerCase() : 'x') + 'x',
    existingPlayers
  );
  if (!playerInfo.record) playerInfo.record = [0,0,0];
  return [playerId, playerInfo];
};

const getPlayers = (newPlayerList, existing) =>
  newPlayerList.reduce((obj, name) => {
      const [id,val] = getPlayer({name}, obj);
      obj[id] = val; return obj;
    }, {...existing}
  );