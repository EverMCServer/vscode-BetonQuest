import { memo, useState } from "react";
import * as React from 'react';
import {
  Handle,
  Position,
  useReactFlow,
  NodeProps,
  Connection,
} from "reactflow";
import { connectionAvaliable } from "../utils/commonUtils";
import "./styles.css";
import ConversationYamlModel from "../utils/conversationYamlModel";

export default memo(({ data, selected }: NodeProps) => {
  const [getTrigger, setTrigger] = useState(false);
  const refreshUI = () => {
    setTrigger(!getTrigger);
  };

  // Conversation file name
  const getFileName = (): string => {
    return data["fileName"] || "";
  };
  const setFileName = (value: string): void => {
    data["fileName"] = value;
    refreshUI();
  };

  // NPC's display name
  const getQuester = (): string => {
    return Object.assign(new ConversationYamlModel(), data["yaml"]).getQuester(data["translationSelection"]) || "";
  };
  const setQuester = (value: string): void => {
    const yaml = Object.assign(new ConversationYamlModel(), data["yaml"]);
    yaml.setQuester(value, data["translationSelection"]);
    data["yaml"] = yaml;

    refreshUI();
  };

  // Connect
  const { getNode } = useReactFlow();
  const isConnectable = (line: Connection): boolean => {
    if (!line) {
      return false;
    }
    let source = getNode(line["source"] || "");
    let target = getNode(line["target"] || "");
    if (!source || !target) {
      return false;
    }
    return connectionAvaliable(
      source["type"] || "",
      line["sourceHandle"] || "",
      target["type"] || "",
      line["targetHandle"] || ""
    );
  };

  return (
    <div style={{ width: "100%" }}>
      <div className="title-box start">
        Start
        <div className="nodeName" hidden={selected}>
          ({data.name})
        </div>
      </div>
      <div className="box">
        file name:
        <input
          type="text"
          className="nodrag input"
          value={getFileName()}
          onChange={(e) => setFileName(e.target.value)}
        />
        <hr className="line"></hr>
        NPC name:
        <input
          type="text"
          className="nodrag input"
          value={getQuester()}
          onChange={(e) => setQuester(e.target.value)}
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
