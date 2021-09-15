import React, { useState, useEffect } from "react";

const defaultApi = 'test_backend';
const callApi = async path => {
  const res = await fetch(path);
  const body = await res.json();
  
  if (res.status !== 200) throw Error(body.message);
  return body;
}


function App() {
  const [state, loadData] = useState({ data: {} });

  useEffect(() => {
    callApi(defaultApi)
      .then(data => loadData({
        data, loaded: true,
        err: !data || !Object.keys(data) ? 'Site data not found' : false,
      }))
      .catch(err => {
        loadData({
          data: {}, loaded: true,
          err: err.message || err || 'Error loading site data',
        });
      });
  }, []);
  
  return pug`
    div
      h1.text-center My React App
      
      if state.loaded && !state.err
        .text-center= state.data.result
          
      else if !state.loaded
        .text-center Loading...

      else
        .text-center= state.err
  `;
}

export default App;
