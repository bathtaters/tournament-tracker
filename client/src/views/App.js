import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";

import Header from "./Header";
import Schedule from "./Schedule";
import Draft from "./Draft";
import Players from "./Players";
import Profile from "./Profile";

// import callApi from "../controllers/callApi";
import testData from "../assets/testData";

function App() {
  const [state, loadData] = useState({ data: {} });

  // useEffect(() => callApi('test_backend').then(loadData), []);
  useEffect(() => loadData({loaded:true, data:testData}), []);
  
  const loggedIn = true;
  return pug`
    .min-h-screen.relative
      Router
        Header(title=state.data.settings ? state.data.settings.title || "" : "")
        
        .m-2
          if state.loaded && !state.err && loggedIn
            Switch
              Redirect(exact=true from="/" to="/home")

              Route(path="/home" exact=true)
                Schedule(schedule=state.data.schedule range=state.data.settings.dateRange drafts=state.data.drafts)

              Route(path="/draft/:id")
                Draft(drafts=state.data.drafts players=state.data.players)
              
              Route(path="/players")
                Players(ranking=state.data.ranking players=state.data.players)

              Route(path="/profile/:id")
                Profile(data=state.data.players)
              
              Route(path="*")
                .text-center This is not a page.

          else if !state.loaded
            h4.text-center Loading...

          else if state.err
            h4.text-center= 'Error: '+state.err
          
          else
            h4.text-center
              a(href="#") Login Here
  `;
}

export default App;
