import React from "react";
import { BrowserRouter } from "react-router-dom";

import Header from "./pages/header/Header";
import Routing from "./Routing";
import RawData from "./pages/shared/RawData";

import { useSettingsQuery } from "./pages/schedule/baseApi";

import { formatQueryError } from "./assets/strings";

function App() {
  const { data, isLoading, error } = useSettingsQuery();

  return (
    <div className="min-h-screen relative">
      { isLoading ? 
        <h4 className="m-2 text-center">Loading your data...</h4>
      : error ? 
        <h4 className="m-2 text-center">{formatQueryError(error)}</h4>
      : 
        <BrowserRouter>
          <Header title={data && data.title} />
          <div className="m-2">
            <Routing />
            <RawData className="text-xs" data={data} />
          </div>
        </BrowserRouter>
      }
    </div>
  );
}

export default App;
