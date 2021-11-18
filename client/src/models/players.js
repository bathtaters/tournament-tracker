// Player Model
// add({ name, (optional player data) })
// rmv(playerId)
// update({ id, (data to update; if [field] === undefined: remove field) })

// TEST METHODS
import testData from '../assets/testData';
import { newId } from "../controllers/testing/testDataAPI";

import { createSlice } from '@reduxjs/toolkit';

export const playersSlice = createSlice({
  name: 'players',
  initialState: testData.players,
  reducers: {
    setPlayers: (state, action) => action.payload,
    addPlayer: (state, action) => {
      // Generate ID
      const playerId = action.payload.id || newId(
        (action.payload.name ? action.payload.name.trim().charAt(0).toLowerCase() : 'x') + 'x',
        state
      );
      // Add default props
      if (!action.payload.record) action.payload.record = [0,0,0];
      // Error check
      if (playerId in state) throw new Error("Error creating player. Duplicate playerId: "+JSON.stringify(action.payload));
      // Create new player
      delete action.payload.id;
      state[playerId] = action.payload;

    }, rmvPlayer: (state, action) => {
      // Error check
      if (!(action.payload in state)) throw new Error("Error removing player. Player does not exist: "+JSON.stringify(action.payload));
      // Remove player
      delete state[action.payload];
      
    }, updatePlayer: (state, action) => {
      // Error check
      if (!(action.payload.id in state)) throw new Error("Error removing player. Player does not exist: "+JSON.stringify(action.payload));
      // Update
      for (const key in action.payload) {
        if (key === 'id') continue;
        else if (action.payload[key] === undefined) delete state[action.payload.id][key];
        else state[action.payload.id][key] = action.payload[key];
      }

    }
  }
})

export const { setPlayers, addPlayer, rmvPlayer, updatePlayer, fetchPlayer } = playersSlice.actions;
export default playersSlice.reducer;



