import { memo, useState } from "react";
import {
  Handle,
  Position,
  useReactFlow,
  NodeProps,
  Connection,
} from "reactflow";
import { connectionAvaliable } from "../utils/commonUtils";
import "./styles.css";

export default memo(({ data, selected }: NodeProps) => {
  const [getTrigger, setTrigger] = useState(false);
  const refreshUI = () => {
    setTrigger(!getTrigger);
  };

  // Text
  const textGet = (): string => {
    return data["text"] || "";
  };
  const textUpdate = (value: string): void => {
    data["text"] = value;
    refreshUI();
  };

  // Text2
  const text2Get = (): string => {
    return data["text2"] || "";
  };
  const text2Update = (value: string): void => {
    data["text2"] = value;
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
