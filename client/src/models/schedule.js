// Draft Schedule
//   =  [ { day: <getTime>, drafts: [ids] }, ... ]
// addToDay(id)
// rmvDraft(id)
// swapDrafts({ a:{ day, id }, b: <same> })
// setSchedule([{days},...])

// TEST METHODS
import testData from '../assets/testData';

import { createSlice } from '@reduxjs/toolkit';

import { sameDay } from '../controllers/getDays';
import getDays from '../controllers/getDays';

// Schedule-specific helpers
const matchesDay = day => day ? d => sameDay(d.day, day) : d => d.day === day;
const getIndexes = (schedule, id) => {
  if (!id) return;
  schedule.forEach((day, i) => {
    const j = day.drafts.indexOf(id);
    if (j >= 0) return [i,j];
  });
}

export const scheduleSlice = createSlice({
  name: 'schedule',
  initialState: getDays(testData.settings.dateRange, testData.schedule),
  reducers: {
    addToDay: (state, action) => {
      let idx = state.findIndex(d => !d.day);
      if (idx < 0) {
        state.push({ day: null, drafts: [] });
        idx = state.length - 1;
      }
      state[idx].drafts.push(action.payload);

    }, rmvFromDay: (state, action) => {
      const idx = getIndexes(state, action.payload.id);
      if (!idx) throw new Error("Error editing schedule: DraftId not found: "+action.payload.id);
      state[idx[0]].drafts.splice(idx[1],1);

    }, swapDrafts: (state, action) => {
      // Error check
      if (
        action.payload.a.id === action.payload.b.id ||
        (!action.payload.b.id && sameDay(action.payload.a.day, action.payload.b.day))
      ) return;
      
      // Find each day
      const dayIdxA = state.findIndex(matchesDay(action.payload.a.day));
      const dayIdxB = state.findIndex(matchesDay(action.payload.b.day));
      if (dayIdxA < 0 || dayIdxB < 0)
        throw new Error("Error editing schedule: Day is invalid: "+(dayIdxA < 0 ? action.payload.a.day : action.payload.b.day));
      
      // Create empty drafts array if doesn't exist
      if (!state[dayIdxA].drafts) state[dayIdxA].drafts = [];
      if (!state[dayIdxB].drafts) state[dayIdxB].drafts = [];
      
      // Find each draft
      const draftIdxA = state[dayIdxA].drafts.indexOf(action.payload.a.id);
      const draftIdxB = action.payload.b.id && state[dayIdxB].drafts.indexOf(action.payload.b.id);
      if (draftIdxA < 0 || (draftIdxB && draftIdxB < 0))
        throw new Error("Error editing schedule: DraftId is invalid: "+(draftIdxA < 0 ? action.payload.a.id : action.payload.b.id));
      
      // Move draft to day
      if (!action.payload.b.id) {
        state[dayIdxB].drafts.push(action.payload.a.id);
        state[dayIdxA].drafts.splice(draftIdxA,1);
      
      // Swap drafts
      } else {
        state[dayIdxA].drafts[draftIdxA] = action.payload.b.id;
        state[dayIdxB].drafts[draftIdxB] = action.payload.a.id;
      }

    },
    setSchedule: (state, action) => action.payload,

  }
})

export const { addToDay, rmvDraft, swapDrafts, setSchedule } = scheduleSlice.actions;
export default scheduleSlice.reducer;

