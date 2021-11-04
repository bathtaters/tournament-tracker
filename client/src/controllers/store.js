import { configureStore } from '@reduxjs/toolkit'

import playersReducer from '../models/players';
import draftsReducer from '../models/drafts';
import scheduleReducer from '../models/schedule';

export default configureStore({
  reducer: {
    players: playersReducer,
    drafts: draftsReducer,
    schedule: scheduleReducer,
  },
})