import React, { memo, useState } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import { connectionAvaliable } from "../utils/commonUtils";
import "./styles.css";

export default memo(({ data }) => {
  const [getTrigger, setTrigger] = useState(false);
  const refreshUI = () => {
    setTrigger(!getTrigger);
  };

  // Text
  const textGet = () => {
    return data["text"] || "";
  };
  const textUpdate = (value) => {
    data["text"] = value;
    refreshUI();
  };
  const text2Get = () => {
    return data["text2"] || "";
  };
  const text2Update = (value) => {
    data["text2"] = value;
    refreshUI();
  };

  // Connect
  const { getNode } = useReactFlow();
  const isConnectable = (line) => {
    let source = getNode(line["source"]);
    let target = getNode(line["target"]);
    return connectionAvaliable(
      source["type"],
      line["sourceHandle"],
      target["type"],
      line["targetHandle"]
    );
  };

  return (
    <div style={{ width: "100%" }}>
      <div className="title-box start">Start</div>
      <div className="box">
        file name:
        <input
          type="text"
          className="nodrag input"
          value={textGet()}
          onChange={(e) => textUpdate(e.target.value)}
        />
        <hr className="line"></hr>
        NPC name:
        <input
          type="text"
          className="nodrag input"
          value={text2Get()}
          onChange={(e) => text2Update(e.target.value)}
        />
      </div>
      <Handle
        id="handleOut"
        type="source"
        position={Position.Bottom}
        className="handleOut"
        isValidConnection={(e) => isConnectable(e)}
      />
    </div>
  );
});
