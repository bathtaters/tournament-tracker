// Draft data
// addDraft({ id?, title, players, etc })
// rmvDraft(draftId)
// updateDraft({ id, title, players, etc })
// pushRound({ id (draft), activePlayers })
// popRound(id (draft))
// setRound({ draftId, round, data: {...} })
// setMatch({ draftId, id || idx[round,match], data: {...} })

// TEST METHODS
import testData from '../assets/testData';
import { newId, newRound } from '../controllers/testing/testDataAPI';

import { createSlice } from '@reduxjs/toolkit';

// Constants
import { defaultDraftTitle } from '../assets/strings';
const draftDefaults = { title: defaultDraftTitle, players: [], isDone: false, matches: [] };

// Helper function
const find2dByKey = (matchArray, key, value, idx = []) => {
  for (let r = idx[0] || 0; r < matchArray.length; r++) {
    for (let m = idx[1] || 0; m < matchArray[r].length; m++) {
      if (matchArray[r][m][key] === value) return [r,m];
      if (idx[1] != null && m >= idx[1]) break;
    }
    if (idx[0] != null && r >= idx[0]) break;
  }
  return [];
}

export const draftsSlice = createSlice({
  name: 'drafts',
  initialState: testData.drafts,
  reducers: {
    setDrafts: (state, action) => action.payload,
    addDraft: (state, action) => {
      // Generate ID
      const draftId = action.payload.id || newId('d', state);
      // Add default props
      const draftData = { ...draftDefaults, ...action.payload  };
      // Error check
      if (draftId in state) throw new Error("Error creating draft. Duplicate draftId: "+JSON.stringify(action.payload));
      // Create new draft
      delete draftData.id;
      state[draftId] = draftData;

    }, rmvDraft: (state, action) => {
      // Error check
      if (!(action.payload in state)) throw new Error("Error removing draft. Draft does not exist: "+JSON.stringify(action.payload));
      // Remove player
      delete state[action.payload];

    }, updateDraft: (state, action) => {
      // Error check
      if (!(action.payload.id in state)) throw new Error("Error updating draft. Draft does not exist: "+JSON.stringify(action.payload));
      // Update
      for (const key in action.payload) {
        if (key === 'id') continue;
        else if (action.payload[key] === undefined) delete state[action.payload.id][key];
        else state[action.payload.id][key] = action.payload[key];
      }

    }, pushRound: (state, action) => {
      if (!state[action.payload.id]) throw new Error("Error updating draft round. Draft does not exist: "+JSON.stringify(action.payload));
      if (!state[action.payload.id].matches) state[action.payload.id].matches = [];

      state[action.payload.id].matches.push(
        newRound(
          action.payload.activePlayers,
          action.payload.id,
          state[action.payload.id].matches.length + 1
        )
      );
      
    }, popRound: (state, action) => {
      if (!state[action.payload]) throw new Error("Error updating draft round. Draft does not exist: "+JSON.stringify(action.payload));
      if (!state[action.payload].matches || !state[action.payload].matches.length) return;

      state[action.payload].matches.pop();
      
    }, setRound: (state, action) => {
      // Error check
      if (!(action.payload.draftId in state)) throw new Error("Error updating round. Draft does not exist: "+JSON.stringify(action.payload));
      if (isNaN(action.payload.round)) throw new Error("Error updating round. Round not given: "   +  JSON.stringify(action.payload));
      // Set round
      state[action.payload.draftId].matches[action.payload.round] = action.payload.data;

    }, setMatch: (state, action) => {
      // if (!action.payload.id) action.payload.id = action.payload.match.id; // Get ID from match
      // Error check
      if (!(action.payload.draftId in state)) throw new Error("Error updating match. Draft does not exist: "+JSON.stringify(action.payload));
      if (!action.payload.id && (!action.payload.idx || action.payload.idx.length < 2))
        throw new Error("Error updating match. Must provide matchId or match/round indexes: "+JSON.stringify(action.payload));
      // Find match
      let idx = action.payload.idx || [];
      if (idx.length < 2) idx = find2dByKey(state[action.payload.draftId].matches, 'id', action.payload.id, idx);
      if (idx.length < 2) idx = find2dByKey(state[action.payload.draftId].matches, 'id', action.payload.id, idx.slice(0,1));
      if (idx.length < 2) idx = find2dByKey(state[action.payload.draftId].matches, 'id', action.payload.id);
      if (idx.length < 2) throw new Error("Error updating match. Match does not exist: " + JSON.stringify(action.payload));
      // Set match
      state[action.payload.draftId].matches[idx[0]][idx[1]] = action.payload.data;

    }
  }
})

export const { setDrafts, addDraft, rmvDraft, updateDraft, pushRound, popRound, setRound, setMatch, fetchDraft } = draftsSlice.actions;
export default draftsSlice.reducer;
