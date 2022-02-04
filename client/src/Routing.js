import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import ErrorBoundary from "./pages/shared/ErrorBoundary";

// Prefetch API data (Load in all calls to allow lazy loading)
import { usePrefetch } from "./pages/schedule/baseApi";
import { } from "./pages/event/eventApi";
import { } from "./pages/event/matchApi";
import { } from "./pages/players/playerApi";

// Lazy load each main route
const Schedule = lazy(() => import("./pages/schedule/Schedule"));
const Event    = lazy(() => import("./pages/event/Event"));
const Players  = lazy(() => import("./pages/players/Players"));
const Profile  = lazy(() => import("./pages/profile/Profile"));

function Routing() {
  // Preload page data
  const loadSched  = usePrefetch('schedule');
  const loadEvent  = usePrefetch('event');
  const loadPlayer = usePrefetch('player');
  const loadStats  = usePrefetch('stats');
  useEffect(() => {
    loadSched(); loadEvent(); loadPlayer(); loadStats();
  }, [loadSched,loadEvent,loadPlayer,loadStats]);

  return (
    <ErrorBoundary>
      <Suspense fallback={<h4 className="m-2 text-center">Loading your data...</h4>}>
        <Routes>
          <Route path="/"            element={<Navigate replace to="/home" />} />
          <Route path="/home"        element={<Schedule />} />
          <Route path="/event/:id"   element={<Event />} />
          <Route path="/players"     element={<Players />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="*"            element={<Navigate replace to="/home" />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default Routing;
