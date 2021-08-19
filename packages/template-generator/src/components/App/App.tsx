import React from "react";
import "./App.css";
import { Header } from "../Header/Header";
import { TemplateBuilder } from "../TemplateBuilder/TemplateBuilder";

function App() {
  return (
    <div className="app-container">
      <Header />
      <TemplateBuilder />
    </div>
  );
}

export default App;
