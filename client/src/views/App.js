import React from "react";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";

import Header from "./Header";
import Schedule from "./Schedule";
import Draft from "./Draft";
import Players from "./Players";
import Profile from "./Profile";

import { useSettingsQuery, useResetDbMutation } from "../models/baseApi";
import { formatQueryError, showRawJson } from "../assets/strings";

function App() {
  const { data, isLoading, error } = useSettingsQuery();
  const [ resetDb ] = useResetDbMutation();

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
                Schedule(range=data.dateRange)
                .block.text-center.m-6
                  input.m-2(type="button" value="Reset Data" onClick=()=>resetDb(0))
                  input.m-2(type="button" value="Full Reset" onClick=()=>resetDb(1))

              Route(path="/draft/:id")
                Draft
              
              Route(path="/players" exact=true)
                Players

              Route(path="/profile/:id")
                Profile
              
              Redirect(from="*" to="/home")
              
            if showRawJson
              .text-center.font-thin.m-2.text-xs.dim-color= JSON.stringify(data)
  `;
}

export default App;
