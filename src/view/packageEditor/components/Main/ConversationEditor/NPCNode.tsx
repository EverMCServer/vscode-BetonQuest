import React, { memo, useContext, useState } from "react";
import {
  Handle,
  Position,
  useReactFlow,
  NodeProps,
  Connection,
} from "reactflow";
import TextArea from "antd/es/input/TextArea";

import L from "../../../../../i18n/i18n";
import DraggableList from "../../../../components/DraggableList";
import { connectionAvaliable } from "../utils/commonUtils";
import { NodeData } from "./Nodes";
import { YamlPathPointer } from "../../../../../utils/yamlPathPointer";

import "./styles.css";

export default memo(({ data, selected }: NodeProps<NodeData>) => {
  const [getTrigger, setTrigger] = useState(false);
  const refreshUI = () => {
    setTrigger(!getTrigger);
  };

  // Conditions
  const conditionsGet = (): string[] => {
    return data.option?.getConditionNames() || [];
  };
  const conditionAdd = (): void => {
    data.option?.insertConditionNames([""]);

    data.syncYaml();
    refreshUI();
  };
  const conditionDel = (pos: number): void => {
    const arr = conditionsGet();
    data.option?.setConditionNames([...arr.slice(0, pos), ...arr.slice(pos + 1)]);

    data.syncYaml();
    refreshUI();
  };
  const conditionUpdate = (index: number, value: string): void => {
    data.option?.editConditionName(index, value);

    data.syncYaml();
    refreshUI();
  };
  const conditionsSet = (conditions: string[]) => {
    data.option?.setConditionNames(conditions);

    data.syncYaml();
    refreshUI();
  };

  // Text
  const textGet = (): string => {
    return data.option?.getText(data.translationSelection) || "";
  };
  const textUpdate = (value: string): void => {
    data.option?.setText(value, data.translationSelection);

    data.syncYaml();
    refreshUI();
  };

  // Events
  const eventsGet = (): string[] => {
    return data.option?.getEventNames() || [];
  };
  const eventDel = (pos: number): void => {
    const arr = eventsGet();
    data.option?.setEventNames([...arr.slice(0, pos), ...arr.slice(pos + 1)]);

    data.syncYaml();
    refreshUI();
  };
  const eventUpdate = (index: number, value: string): void => {
    data.option?.editEventName(index, value);

    data.syncYaml();
    refreshUI();
  };
  const eventsSet = (conditions: string[]) => {
    data.option?.setEventNames(conditions);

    data.syncYaml();
    refreshUI();
  };

  // Connect
  const { getNode } = useReactFlow<NodeData>();
  const isConnectable = (line: Connection): boolean => {
    if (!line) {
      return false;
    }
    let source = getNode(line.source || "");
    let target = getNode(line.target || "");
    if (!source || !target) {
      return false;
    }
    return connectionAvaliable( //
      source.type || "",
      line.sourceHandle || "",
      target.type || "",
      line.targetHandle || ""
    );
  };

  // Handle Conditions and Events' click
  const { setDocumentPathPointer, setEditorPathPointer } = useContext(YamlPathPointer);
  const onConditionClick = (item: string, pos: number) => {
    // Broadcast Yaml Pointer
    setDocumentPathPointer(["conditions", item]);
    setEditorPathPointer(["conditions", item]);
  };
  const onEventClick = (item: string, pos: number) => {
    // Broadcast Yaml Pointer
    setDocumentPathPointer(["events", item]);
    setEditorPathPointer(["events", item]);
  };

  return (
    <div style={{ width: "100%" }}>
      <div className="title-box npc">
        {L("*.conversation.npcNode.npc")}
        <div className="nodeName">
          ({data.option?.getName()})
        </div>
      </div>
      <div className="box">
        <div className="container">
          {L("*.conversation.*.conditions")}
        </div>
        <DraggableList
          items={conditionsGet()}
          onAdd={(v, i) => conditionUpdate(i, v)}
          onRemove={(_, i) => conditionDel(i)}
          onSort={e => conditionsSet(e)}
          onChange={(_, __, e) => conditionsSet(e)}
          onTagClick={onConditionClick}
          newTagText={<>+ {L("*.conversation.*.addCondition")}</>}
          tagTextPattern={/^[\S]+$/}
        />
        <hr className="line"></hr>
        {L("*.conversation.*.text")}
        <TextArea
          className="nodrag"
          value={textGet()}
          onChange={(e) => textUpdate(e.target.value)}
          spellCheck="false"
          autoSize={{ minRows: 2, maxRows: 8 }}
          size="small"
        />
        <hr className="line"></hr>
        <div className="container">
          {L("*.conversation.*.events")}
        </div>
        <DraggableList
          items={eventsGet()}
          onAdd={(v, i) => eventUpdate(i, v)}
          onRemove={(_, i) => eventDel(i)}
          onSort={e => eventsSet(e)}
          onChange={(_, __, e) => eventsSet(e)}
          onTagClick={onEventClick}
          newTagText={<>+ {L("*.conversation.*.addEvent")}</>}
          tagTextPattern={/^[\S]+$/}
        />
      </div>

      <Handle
        id="handleIn"
        type="target"
        position={Position.Top}
        className="handleIn"
        isValidConnection={(e) => isConnectable(e)}
      />
      <Handle
        id="handleOut"
        type="source"
        position={Position.Bottom}
        className="handleOut"
        isValidConnection={(e) => isConnectable(e)}
      />
      <Handle
        id="handleN"
        type="source"
        position={Position.Right}
        className="handleN"
        isValidConnection={(e) => isConnectable(e)}
      />
    </div>
  );
});
