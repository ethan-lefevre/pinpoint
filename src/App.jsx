import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Header from "./components/Header";
import Home from "./pages/Home";
import Rankings from "./pages/Rankings";
import Results from "./pages/Results";
import LetterOfTheWeek from "./pages/LotW";
import Subscribe from "./pages/Paywall";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";

import PageWrapper from "./components/PageWrapper";

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