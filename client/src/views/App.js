import React, { useEffect } from "react";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";

import Header from "./Header";
import Schedule from "./Schedule";
import Draft from "./Draft";
import Players from "./Players";
import Profile from "./Profile";

import { useSettingsQuery, usePrefetch } from "../models/baseApi";
import { formatQueryError } from "../assets/strings";

function App() {
  const { data, isLoading, error } = useSettingsQuery();

  // Preload base data
  const loadSched  = usePrefetch('schedule');
  const loadDraft  = usePrefetch('draft');
  const loadPlayer = usePrefetch('player');
  const loadStats  = usePrefetch('breakers');
  useEffect(() => {
    loadSched(); loadDraft(); loadPlayer(); loadStats();
  }, [loadSched,loadDraft,loadPlayer,loadStats]);

  return pug`
    .min-h-screen.relative
      if isLoading
        h4.m-2.text-center Loading your data...
      
      else if error
        h4.m-2.text-center= formatQueryError(error)

      else
        Router
          Header(title=(data && data.title))
          
          .m-2
            Switch
              Redirect(exact=true from="/" to="/home")

              Route(path="/home" exact=true)
                Schedule

              Route(path="/draft/:id")
                Draft
              
              Route(path="/players" exact=true)
                Players

              Route(path="/profile/:id")
                Profile
              
              Redirect(from="*" to="/home")
              
            if data.showrawjson
              .text-center.font-thin.m-2.text-xs.dim-color= JSON.stringify(data)
  `;
}

export default App;
