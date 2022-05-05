import React from "react";
import { BrowserRouter } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import Header from "./pages/header/Header";
import Footer from "./pages/footer/Footer";
import Routing from "./Routing";
import Loading from "./pages/common/Loading";
import Alert from "./pages/common/Alert";
import LockScreen from "./pages/common/LockScreen";
import ErrorBoundary from "./pages/common/ErrorBoundary";
import { AppWrapperStyle, PageWrapperStyle } from "./pages/common/styles/CommonStyles";

import { useSettingsQuery } from "./pages/common/common.fetch";

function App() {
  const { data, isLoading, error } = useSettingsQuery();

  if (isLoading || error)
    return <Loading loading={isLoading} error={error} className="m-8 text-xl" />;

  return (
    <AppWrapperStyle>
      <BrowserRouter>
        <ErrorBoundary>
          <DndProvider backend={HTML5Backend}>
            <Alert />
            <Header title={data && data.title} />
            <PageWrapperStyle><Routing /></PageWrapperStyle>
            <Footer />
            <LockScreen />
          </DndProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </AppWrapperStyle>
  );
}

export default App;
