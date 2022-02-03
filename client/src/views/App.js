import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Header from "./main/Header";
import Schedule from "./main/Schedule";
import Event from "./main/Event";
import Players from "./main/Players";
import Profile from "./main/Profile";
import RawData from "./components/shared/RawData";

import { useSettingsQuery, usePrefetch } from "../queries/baseApi";
import { formatQueryError } from "../assets/strings";

function App() {
  const { data, isLoading, error } = useSettingsQuery();

  // Preload base data
  const loadSched  = usePrefetch('schedule');
  const loadEvent  = usePrefetch('event');
  const loadPlayer = usePrefetch('player');
  const loadStats  = usePrefetch('stats');
  useEffect(() => {
    loadSched(); loadEvent(); loadPlayer(); loadStats();
  }, [loadSched,loadEvent,loadPlayer,loadStats]);

  return (
    <div className="min-h-screen relative">
      { isLoading ? 
        <h4 className="m-2 text-center">Loading your data...</h4>
      : error ? 
        <h4 className="m-2 text-center">{formatQueryError(error)}</h4>
      : 
        <Router>
          <Header title={data && data.title} />
          <div className="m-2">
            <Routes>
              <Route path="/" element={<Navigate replace to="/home" />} />
              <Route path="/home" element={<Schedule />} />
              <Route path="/event/:id" element={<Event />} />
              <Route path="/players" element={<Players />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="*" element={<Navigate replace to="/home" />} />
            </Routes>
            <RawData className="text-xs" data={data} />
          </div>
        </Router>
      }
    </div>
  );
}

export default App;
