import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Header from "./components/header.jsx";
import Home from "./pages/home.jsx";
import Rankings from "./pages/Rankings.jsx";
import Results from "./pages/Results.jsx";
import LetterOfTheWeek from "./pages/lotw.jsx";
import Subscribe from "./pages/paywall.jsx";
import ProtectedRoute from "./components/protectedroute.jsx";
import Login from "./pages/login.jsx";
import PageWrapper from "./components/pagewrapper.jsx";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageWrapper>
              <Home />
            </PageWrapper>
          }
        />

        <Route
          path="/login"
          element={
            <PageWrapper>
              <Login />
            </PageWrapper>
          }
        />

        <Route
          path="/subscribe"
          element={
            <PageWrapper>
              <Subscribe />
            </PageWrapper>
          }
        />

        <Route
          path="/rankings"
          element={
            <ProtectedRoute endpoint="rankings">
              <PageWrapper>
                <Rankings />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/results"
          element={
            <ProtectedRoute endpoint="results">
              <PageWrapper>
                <Results />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/lotw"
          element={
            <ProtectedRoute endpoint="letters">
              <PageWrapper>
                <LetterOfTheWeek />
              </PageWrapper>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Header />
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;
