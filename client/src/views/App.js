import React from "react";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";

import Header from "./Header";
import Schedule from "./Schedule";
import Draft from "./Draft";
import Players from "./Players";
import Profile from "./Profile";

import { useGetSettingsQuery, useResetDbMutation } from "../models/dbApi";

function App() {
  const { data, isLoading, error } = useGetSettingsQuery();
  const [ resetDb ] = useResetDbMutation();

  return pug`
    .min-h-screen.relative
      if isLoading
        h4.m-2.text-center Loading your data...
      
      else if error
        h4.m-2.text-center= 'Error: '+JSON.stringify(error)

      else
        Router
          Header(title=(data && data.title))
          
          .m-2
            Switch
              Redirect(exact=true from="/" to="/home")

              Route(path="/home" exact=true)
                Schedule(range=data.dateRange)

              Route(path="/draft/:id")
                Draft
              
              Route(path="/players" exact=true)
                Players

              Route(path="/profile/:id")
                Profile
              
              Redirect(from="*" to="/home")

            .block.text-center.m-6
              input(type="button" value="Reset Data" onClick=resetDb)
  `;
}

export default App;
