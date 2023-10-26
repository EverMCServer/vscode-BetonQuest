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
import { Select } from "antd";
import { NodeData } from "./Nodes";

export default memo(({ data, selected }: NodeProps<NodeData>) => {
  const [getTrigger, setTrigger] = useState(false);
  const refreshUI = () => {
    setTrigger(!getTrigger);
  };

  // Conversation "stop" setting
  const getStop = (): string => {
    return data.conversation?.getStop() || "false";
  };
  const setStop = (value: string): void => {
    data.conversation?.setStop(value);

    data.syncYaml();
    refreshUI();
  };

  // Conversation "final_events"
  const getFinalEvents = (): string[] => {
    return data.conversation?.getFinalEventNames() || [];
  };
  const setFinalEvents = (value: string[]): void => {
    data.conversation?.setFinalEventNames(value);

    data.syncYaml();
    refreshUI();
  };

  // Conversation "interceptor"
  const getInterceptor = (): string[] => {
    return data.conversation?.getInterceptor() || [];
  };
  const setInterceptor = (value: string[]): void => {
    data.conversation?.setInterceptor(value);

    data.syncYaml();
    refreshUI();
  };

  // NPC's display name
  const getQuester = (): string => {
    return data.conversation?.getQuester(data.translationSelection) || "";
  };
  const setQuester = (value: string): void => {
    data.conversation?.setQuester(value, data.translationSelection);

    data.syncYaml();
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

  // Handle new Edge connection created
  // For "Edge connection changed from one node to another" event, check out ConversationEditor.tsx > onEdgeUpdateEnd()
  const onConnect = React.useCallback((connection: Connection) => {
    // TODO
    console.log("onConnect from StartNode", connection);
  }, []);

  return (
    <div style={{ width: "100%" }}>
      <div className="title-box start">
        Start
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
            dropdownAlign={{points:['tr', 'br']}}
            getPopupContainer={triggerNode => triggerNode.parentElement.parentElement}
            className="nodrag"
            size="small"
            showSearch
            popupMatchSelectWidth={false}
            onChange={e => setStop(e)}
            options={[{ value: "false" }, { value: "true" }]}
          />
        </div>
        <hr className="line"></hr>
        <div>
          Final events:&nbsp;
          <Select
            value={getFinalEvents()}
            dropdownAlign={{points:['tr', 'br']}}
            getPopupContainer={triggerNode => triggerNode.parentElement.parentElement}
            className="nodrag"
            size="small"
            mode="tags"
            popupMatchSelectWidth={false}
            style={{width: "100%"}}
            placeholder={"(none)"}
            tokenSeparators={[',', ' ']}
            onChange={e => setFinalEvents(e)}
            options={[]}
          />
        </div>
        <hr className="line"></hr>
        <div>
          Interceptor:&nbsp;
          <Select
            value={getInterceptor()}
            dropdownAlign={{points:['tr', 'br']}}
            getPopupContainer={triggerNode => triggerNode.parentElement.parentElement}
            className="nodrag"
            size="small"
            mode="multiple"
            popupMatchSelectWidth={false}
            style={{width: "100%"}}
            placeholder={"(none)"}
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
        onConnect={onConnect}
      />
    </div>
  );
});
