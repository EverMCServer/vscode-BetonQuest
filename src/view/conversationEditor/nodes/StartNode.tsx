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
import { Select } from "antd";

export default memo(({ data, selected }: NodeProps) => {
  const [getTrigger, setTrigger] = useState(false);
  const refreshUI = () => {
    setTrigger(!getTrigger);
  };

  // Conversation "stop" setting
  const getStop = (): string => {
    return Object.assign(new ConversationYamlModel(), data["yaml"]).getStop() || "false";
  };
  const setStop = (value: string): void => {
    const yaml = Object.assign(new ConversationYamlModel(), data["yaml"]);
    yaml.setStop(value);
    data["yaml"] = yaml;
    data.updateYaml();

    refreshUI();
  };

  // Conversation "final_events"
  const getFinalEvents = (): string[] => {
    return Object.assign(new ConversationYamlModel(), data["yaml"]).getFinalEvents();
  };
  const setFinalEvents = (value: string[]): void => {
    const yaml = Object.assign(new ConversationYamlModel(), data["yaml"]);
    yaml.setFinalEvents(value);
    data["yaml"] = yaml;
    data.updateYaml();

    refreshUI();
  };

  // Conversation "interceptor"
  const getInterceptor = (): string[] => {
    return Object.assign(new ConversationYamlModel(), data["yaml"]).getInterceptor();
  };
  const setInterceptor = (value: string[]): void => {
    const yaml = Object.assign(new ConversationYamlModel(), data["yaml"]);
    yaml.setInterceptor(value);
    data["yaml"] = yaml;
    data.updateYaml();

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
        {/* <div className="nodeName" hidden={selected}>
          ({getFileName()})
        </div> */}
      </div>
      <div className="box">
        <div>
          NPC name:
          <input
            type="text"
            className="nodrag input"
            value={getQuester()}
            onChange={(e) => setQuester(e.target.value)}
          />
        </div>
        <hr className="line"></hr>
        <div>
          Stop when player leave:&nbsp;
          <Select
            value={getStop()}
            // style={{height: "18px"}}
            className="nodrag"
            size="small"
            showSearch
            popupMatchSelectWidth={false}
            onChange={e => setStop(e)}
            options={[{ value: "false" }, { value: "true" }]}
          />
        </div>
        <div>
          Final events:&nbsp;
          <Select
            value={getFinalEvents()}
            // style={{height: "18px"}}
            className="nodrag"
            size="small"
            mode="tags"
            tokenSeparators={[',', ' ']}
            popupMatchSelectWidth={false}
            onChange={e => setFinalEvents(e)}
            options={[]}
          />
        </div>
        <div>
          Interceptor:&nbsp;
          <Select
            value={getInterceptor()}
            // style={{height: "18px"}}
            className="nodrag"
            size="small"
            mode="multiple"
            popupMatchSelectWidth={false}
            onChange={e => setInterceptor(e)}
            options={[{ value: "simple" }, { value: "packet" }, { value: "none" }]}
          />
        </div>
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
