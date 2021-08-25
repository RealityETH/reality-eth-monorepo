import React from "react";
import "./App.css";
import { Header } from "../Header/Header";
import { Views } from "../Views";
import { BrowserRouter } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Header />
        <Views />
      </div>
    </BrowserRouter>
  );
}

export default App;
