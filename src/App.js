// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {UrlShortner , LandingPage, SignIn , SignUp ,MainPage} from "./components"; // Adjust the path as needed
import {RedirectHandler} from "./components"; // Import the redirect handler

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/urlshortner" element={<UrlShortner />} />
        <Route path="/mainpage" element={<MainPage />} />
        

        <Route path="/:hash" element={<RedirectHandler />} />
      </Routes>
    </Router>
  );
}

export default App;
