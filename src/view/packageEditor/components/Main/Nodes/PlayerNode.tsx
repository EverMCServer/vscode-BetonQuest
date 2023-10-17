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
import { NodeData } from "./Nodes";

export default memo(({ data, selected }: NodeProps<NodeData>) => {
  const [getTrigger, setTrigger] = useState(false);
  const refreshUI = () => {
    setTrigger(!getTrigger);
  };

  // Lazy update
  // Critical thinking: maybe it is better to move it to ConversatinEditor?
  let lazySyncYamltimeoutHandler: number;
  const lazySyncYaml = () => {
    // Prevent Yaml update if a user is still typing.
    window.clearTimeout(lazySyncYamltimeoutHandler);

    // Delayed Yaml update.
    lazySyncYamltimeoutHandler = window.setTimeout(() => {
      // Update
      data.syncYaml();
    }, 1000);
  };

  // Conditions
  const conditionsGet = (): string[] => {
    return data.option?.getConditionNames() || [];
  };
  const conditionAdd = (): void => {
    data.option?.insertConditionNames([""]);

    lazySyncYaml();
    refreshUI();
  };
  const conditionDel = (): void => {
    const arr = [...conditionsGet()];
    arr?.pop();
    data.option?.setConditionNames(arr || []);

    lazySyncYaml();
    refreshUI();
  };
  const conditionUpdate = (index: number, value: string): void => {
    data.option?.editConditionName(index, value);

    lazySyncYaml();
    refreshUI();
  };

  // Text
  const textGet = (): string => {
    return data.option?.getText(data.translationSelection) || "";
  };
  const textUpdate = (value: string): void => {
    data.option?.setText(value, data.translationSelection);

    lazySyncYaml();
    refreshUI();
  };

  // Events
  const eventsGet = (): string[] => {
    return data.option?.getEventNames() || [];
  };
  const eventAdd = (): void => {
    data.option?.insertEventNames([""]);

    lazySyncYaml();
    refreshUI();
  };
  const eventDel = (): void => {
    const arr = [...eventsGet()];
    arr.pop();
    data.option?.setEventNames(arr);

    lazySyncYaml();
    refreshUI();
  };
  const eventUpdate = (index: number, value: string): void => {
    data.option?.editEventName(index, value);

    lazySyncYaml();
    refreshUI();
  };

  // Connect
  const { getNode } = useReactFlow();
  const isConnectable = (line: Connection): boolean => {
    if (!line) {
      return false;
    }
    let source = getNode(line.source || "");
    let target = getNode(line.target || "");
    if (!source || !target) {
      return false;
    }
    return connectionAvaliable(
      source.type || "",
      line.sourceHandle || "",
      target.type || "",
      line.targetHandle || ""
    );
  };

  return (
    <div style={{ width: "100%" }}>
      <div className="title-box player">
        Player
        <div className="nodeName" hidden={selected}>
          ({data.option?.getName()})
        </div>
      </div>
      <div className="box">
        <div className="container">
          conditions:
          <div className="buttons">
            <button onClick={conditionDel} className="actionButton">
              -
            </button>
            <button onClick={conditionAdd} className="actionButton">
              +
            </button>
          </div>
        </div>
        {conditionsGet().map((value, index) => (
          <input
            key={index}
            type="text"
            value={value}
            onChange={(e) => conditionUpdate(index, e.target.value)}
            className="nodrag input"
          />
        ))}
        <hr className="line"></hr>
        text:
        <textarea
          className="nodrag textArea"
          value={textGet()}
          onChange={(e) => textUpdate(e.target.value)}
          spellCheck="false"
        />
        <hr className="line"></hr>
        <div className="container">
          events:
          <div className="buttons">
            <button onClick={eventDel} className="actionButton">
              -
            </button>
            <button onClick={eventAdd} className="actionButton">
              +
            </button>
          </div>
        </div>
        {eventsGet().map((value, index) => (
          <input
            key={index}
            type="text"
            value={value}
            onChange={(e) => eventUpdate(index, e.target.value)}
            className="nodrag input"
          />
        ))}
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
    </div>
  );
});
