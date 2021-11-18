import React, { useState, useEffect, useCallback } from "react";
import { useDispatch } from 'react-redux';
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";

import Header from "./Header";
import Schedule from "./Schedule";
import Draft from "./Draft";
import Players from "./Players";
import Profile from "./Profile";

import { setDrafts } from "../models/drafts";
import { setPlayers } from "../models/players";
import { setSchedule } from "../models/schedule";
import getDays from '../controllers/getDays';
import callApi from "../controllers/callApi";
// import testData from "../assets/testData";

function App() {
  const dispatch = useDispatch();
  const [pageData, setPageData] = useState({ loaded: false });
  const [pageSettings, setSettings] = useState(null);

  const setAll = useCallback(({ drafts, players, schedule, settings, err }) => {
    if (err) return setPageData({ loaded: true, err });
    dispatch(setDrafts(drafts));
    dispatch(setPlayers(players));
    dispatch(setSchedule(getDays(settings.dateRange, schedule)));
    // setSettings({ drafts, players, schedule, settings, err });
    setSettings(settings);
    setPageData({ loaded: true });
  }, [dispatch]);

  useEffect(() => callApi('get/all').then(setAll), [setAll]);
  // useEffect(() => loadData({loaded:true, data:testData}), []);

  const resetData = e => { e.target.disabled = true; callApi('set/resetDb').then(() => e.target.disabled = false); };
  // const resetData = e => { e.target.disabled = true; setTimeout(t => t.disabled = false, 3000, e.target); };
  
  return pug`
    .min-h-screen.relative
      // .p-4
        p.m-2= JSON.stringify(pageSettings && Object.keys(pageSettings))
        p.m-2= JSON.stringify(pageSettings)

      Router
        Header(title=((pageSettings && pageSettings.title) || "Tournament Tracker"))
        
        .m-2
          if pageData.loaded && !pageData.err
            Switch
              Redirect(exact=true from="/" to="/home")

              Route(path="/home" exact=true)
                Schedule

              Route(path="/draft/:id")
                Draft
              
              Route(path="/players")
                Players

              Route(path="/profile/:id")
                Profile
              
              Route(path="*")
                .text-center This is not a page.

            .block.text-center.m-6
              input(type="button" value="Reset Data" onClick=resetData)

          else if !pageData.loaded
            h4.text-center Loading...

          else
            h4.text-center= 'Error: '+(pageData.err || 'N/A')
  `;
}

export default App;
