import React from "react";
import { BrowserRouter } from "react-router-dom";

import Header from "./pages/header/Header";
import Routing from "./Routing";
import Loading from "./pages/common/Loading";
import Alert from "./pages/common/Alert";
import { AppWrapperStyle, PageWrapperStyle } from "./pages/common/styles/CommonStyles";

import { useSettingsQuery } from "./pages/common/common.fetch";

function App() {
  const { data, isLoading, error } = useSettingsQuery();

  if (isLoading || error)
    return <Loading altMsg="Loading your data..." error={error} className="m-8 text-xl" />;

  return (
    <AppWrapperStyle>
      <Alert />
      <BrowserRouter>
        <Header title={data && data.title} />
        <PageWrapperStyle><Routing /></PageWrapperStyle>
      </BrowserRouter>
    </AppWrapperStyle>
  );
}

export default App;
