import React from "react";
import { createRoot } from "react-dom/client";

import FlowView from "./views/FlowView";
import "./index.css";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <FlowView />
  </React.StrictMode>
);
