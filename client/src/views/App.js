import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";

import Header from "./Header";
import Schedule from "./Schedule";
import Draft from "./Draft";
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
        Header(userId=state.data.activeUser)
        
        .m-2
          if state.loaded && !state.err && loggedIn
            Switch
              Redirect(exact=true from="/" to="/home")

              Route(path="/home" exact=true)
                Schedule(data=state.data.schedule drafts=state.data.drafts)

              Route(path="/draft")
                Draft(data=state.data.drafts players=state.data.players)
              
              Route(path="/profile")
                Profile(data=state.data.players activeUser=state.data.activeUser)
              
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
