import * as React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import FlowView from "./views/FlowView";

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <FlowView />
  </React.StrictMode>
);
