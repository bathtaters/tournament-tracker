import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import ErrorBoundary from "./pages/common/ErrorBoundary";

import { usePrefetchBase } from "./pages/common/common.hooks";

// Lazy load each main route
const Schedule = lazy(() => import("./pages/schedule/Schedule"));
const Event    = lazy(() => import("./pages/event/Event"));
const Players  = lazy(() => import("./pages/players/Players"));
const Profile  = lazy(() => import("./pages/profile/Profile"));

function Routing() {
  usePrefetchBase(); // Preload page data

  return (
    <ErrorBoundary>
      <Suspense fallback={<h4 className="m-2 text-center">Loading your data...</h4>}>
        <Routes>
          <Route path="/"            element={<Navigate replace to="/home" />} />
          <Route path="/home"        element={<Schedule />} />
          <Route path="/event/:id"   element={<Event    />} />
          <Route path="/players"     element={<Players  />} />
          <Route path="/profile/:id" element={<Profile  />} />
          <Route path="*"            element={<Navigate replace to="/home" />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default Routing;
