import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Header from "./Header";
import Schedule from "./Schedule";
import Draft from "./Draft";
import Players from "./Players";
import Profile from "./Profile";
import RawData from "./Components/RawData";

import { useSettingsQuery, usePrefetch } from "../models/baseApi";
import { formatQueryError } from "../assets/strings";

function App() {
  const { data, isLoading, error } = useSettingsQuery();

  // Preload base data
  const loadSched  = usePrefetch('schedule');
  const loadDraft  = usePrefetch('draft');
  const loadPlayer = usePrefetch('player');
  const loadStats  = usePrefetch('stats');
  useEffect(() => {
    loadSched(); loadDraft(); loadPlayer(); loadStats();
  }, [loadSched,loadDraft,loadPlayer,loadStats]);

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
              <Route path="/draft/:id" element={<Draft />} />
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
