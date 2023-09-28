import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Loading from "./pages/common/Loading";
import { usePrefetchBase } from "./pages/common/common.hooks";

// Lazy load each main route
const Schedule      = lazy(() => import("./pages/schedule/Schedule"));
const Event         = lazy(() => import("./pages/event/Event"));
const Players       = lazy(() => import("./pages/players/Players"));
const Profile       = lazy(() => import("./pages/profile/Profile"));
const Plan          = lazy(() => import("./pages/plan/Plan"));
const ResetPassword = lazy(() => import("./pages/resetPassword/ResetPassword"));

function Routing() {
  usePrefetchBase(); // Preload page data

  return (
    <Suspense fallback={<Loading loading={true} />}>
      <Routes>
        <Route path="/"                           element={<Navigate replace to="/home" />} />
        <Route path="/home"                       element={<Schedule       />} />
        <Route path="/plan"                       element={<Plan           />} />
        <Route path="/event/:id"                  element={<Event          />} />
        <Route path="/players"                    element={<Players        />} />
        <Route path="/profile/:id"                element={<Profile        />} />
        <Route path="/profile/:id/reset/:session" element={<ResetPassword  />} />
        <Route path="*"                           element={<Navigate replace to="/home" />} />
      </Routes>
    </Suspense>
  );
}

export default Routing;
