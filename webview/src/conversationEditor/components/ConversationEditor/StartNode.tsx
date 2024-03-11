import * as React from "react";
import { memo, useContext, useState } from "react";
import {
  Handle,
  Position,
  useReactFlow,
  NodeProps,
  Connection,
} from "reactflow";
import { Input, Select } from "antd";

import L from "betonquest-utils/i18n/i18n";
import DraggableList from "../../../components/DraggableList";
import { connectionAvaliable } from "../utils/commonUtils";
import { NodeData } from "./Nodes";
import { YamlPathPointer } from "betonquest-utils/yaml/yamlPathPointer";

import "./styles.css";

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

  // Handle Final Events' click
  const { setDocumentPathPointer, setEditorPathPointer } = useContext(YamlPathPointer);
  const onFinalEventClick = (item: string, pos: number) => {
    // Broadcast Yaml Pointer
    setDocumentPathPointer(["@events", item]);
  };

  return (
    <div style={{ width: "100%" }}>
      <div className="title-box start">
        {L("*.conversation.startNode.start")}
      </div>
      <div className="box">
        <div>
          {L("*.conversation.startNode.quester")}:
          <Input
            type="text"
            className="nodrag"
            value={getQuester()}
            onChange={(e) => setQuester(e.target.value)}
            size="small"
          />
        </div>
        <hr className="line"></hr>
        <div>
          {L("*.conversation.startNode.stop")}:&nbsp;
          <Select
            value={getStop()}
            dropdownAlign={{ points: ['tr', 'br'] }}
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
          {L("*.conversation.startNode.finalEvents")}:&nbsp;
          <DraggableList
            items={getFinalEvents()}
            onAdd={(_, __, e) => setFinalEvents(e)}
            onRemove={(_, __, e) => setFinalEvents(e)}
            onSort={e => setFinalEvents(e)}
            onChange={(_, __, e) => setFinalEvents(e)}
            // onGotoClick={onFinalEventClick}
            // onGotoClickTooltip={L("*.conversation.*.gotoEventTooltip")}
            newTagText={<>+ {L("*.conversation.*.addEvent")}</>}
          />
        </div>
        <hr className="line"></hr>
        <div>
          {L("*.conversation.startNode.interceptor")}:&nbsp;
          <Select
            value={getInterceptor()}
            dropdownAlign={{ points: ['tr', 'br'] }}
            getPopupContainer={triggerNode => triggerNode.parentElement.parentElement}
            className="nodrag"
            size="small"
            mode="multiple"
            popupMatchSelectWidth={false}
            style={{ width: "100%" }}
            placeholder={L("(none)")}
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
