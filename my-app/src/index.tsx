import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import FlowView from "./views/FlowView";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <FlowView />
  </React.StrictMode>
);
