import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import callApi from "../controllers/callApi";

function App() {
  const [state, loadData] = useState({ data: {} });

  useEffect(() => callApi('test_backend').then(loadData), []);
  
  const loggedIn = true;
  return pug`
    .min-h-screen.relative.m-2.mt-24
      Router
        .fixed.top-0.w-full.bg-red-500.bg-opacity-90.h-20
          h1.text-center My React App
        
        if state.loaded && !state.err && loggedIn
          Switch
            Redirect(exact=true from="/" to="/home")

            Route(path="/home" exact=true)
              .text-center= state.data.result
            
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
