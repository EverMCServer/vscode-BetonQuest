import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  MiniMap,
  Panel,
  useReactFlow,
  getRectOfNodes,
  getTransformForBounds,
  MarkerType,
  Background,
  useKeyPress,
} from "reactflow";
import "reactflow/dist/style.css";
import { toJpeg } from "html-to-image";
import "./styles.css";

import { autoLayout } from "../utils/autoLayout";
import { readYaml } from "../utils/readYaml";
import { writeYaml } from "../utils/writeYaml";

import NPCNode from "../nodes/NPCNode";
import PlayerNode from "../nodes/PlayerNode";
import StartNode from "../nodes/StartNode";
import ConnectionLine from "../nodes/ConnectionLine.js";
import {
  downloadFile,
  downloadImage,
  removeLinesOnConnect,
} from "../utils/commonUtils";

const cacheKey = "bq-flow";

const nodeTypes = {
  npcNode: NPCNode,
  playerNode: PlayerNode,
  startNode: StartNode,
};

const initialNode = {
  id: "startNodeID",
  type: "startNode",
  position: { x: 0, y: 0 },
  data: { name: "startNode" },
};

const MyFlowView = () => {
  const flowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([initialNode]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const { setViewport, getNode, getNodes, getEdge, fitView, project } =
    useReactFlow();

  /* ID counter */

  let lineID = 1;
  const getNewLineID = useCallback(() => {
    while (getEdge(`line_${lineID}`)) {
      lineID++;
    }
    return `line_${lineID}`;
  }, [getEdge]);

  let nodeID = 1;
  const getNewNodeID = useCallback(() => {
    while (getNode(`node_${nodeID}`)) {
      nodeID++;
    }
    return `node_${nodeID}`;
  }, [getNode]);

  /* Tools */

  const resetFlow = async (nodes, edges, viewport) => {
    setEdges([]);
    setNodes([]);
    setViewport({ x: 0, y: 0, zoom: 1 });

    setTimeout(() => {
      setNodes(nodes || []);
      setEdges(edges || []);
      if (viewport) {
        setViewport(viewport);
      } else {
        window.requestAnimationFrame(() => fitView());
      }
    }, 0);
  };

  const [needsLayout, setNeedsLayout] = useState(false);

  useEffect(() => {
    if (needsLayout) {
      onAutoLayout();
      setNeedsLayout(false);
    }
  }, [needsLayout]);

  /* Remove unsupport lines */

  const onConnect = useCallback(
    (params) => {
      params["type"] = "step";
      params["markerEnd"] = { type: MarkerType.ArrowClosed };
      const sourceID = params["source"];
      const newEdges = removeLinesOnConnect(
        getNode(sourceID),
        edges,
        sourceID,
        params["sourceHandle"]
      );

      setEdges(addEdge(params, newEdges));
    },
    [edges, getNode]
  );

  /* DEL keyboard button event */

  const deleteButtonPressed = useKeyPress(["Delete"]);
  const deleteSelectedNodes = useCallback(() => {
    const nodes2 = nodes.filter((item, i) => {
      return item.selected != true;
    });
    const edges2 = edges.filter((item, i) => {
      return item.selected != true;
    });
    setNodes(nodes2);
    setEdges(edges2);
  }, [nodes, edges]);

  useEffect(() => {
    deleteSelectedNodes();
  }, [deleteButtonPressed]);

  /* Clear event */

  const onClear = useCallback(() => {
    setEdges([]);
    setNodes([initialNode]);
    window.requestAnimationFrame(() => fitView());
  }, [fitView]);

  /* Create startNode if not exist */

  useEffect(() => {
    const nodesStart = getNode("startNodeID");
    if (!nodesStart || nodesStart.length == 0) {
      setNodes([...nodes, initialNode]);
    }
  }, [nodes, getNode]);

  /* DEBUG Save/Restore event */

  const onSave = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      const json = JSON.stringify(flow);
      localStorage.setItem(cacheKey, json);
    }
  }, [reactFlowInstance]);

  const onRestore = useCallback(() => {
    const flow = JSON.parse(localStorage.getItem(cacheKey));
    if (!flow) {
      return;
    }
    resetFlow(flow.nodes, flow.edges, flow.viewport);
  }, []);

  /* DEBUG Download/Upload event */

  const onDownloadJSON = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      const json = JSON.stringify(flow);
      downloadFile("debug.json", json, "json");
    }
  }, [reactFlowInstance]);

  const onUploadJSON = useCallback(() => {
    document.getElementById("json-upload").click();
  }, []);

  const uploadJSON = useCallback((event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
      const text = event.target.result;
      const flow = JSON.parse(text);
      if (!flow) {
        return;
      }
      resetFlow(flow.nodes, flow.edges, flow.viewport);
    };
    if (file) {
      reader.readAsText(file);
    }
    event.target.value = "";
  }, []);

  /* YML Download/Upload event */

  const onDownloadYML = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      const data = writeYaml(flow);
      downloadFile(data.fileName, data.text, "yml");
    }
  }, [reactFlowInstance]);

  const onUploadYML = useCallback((event) => {
    document.getElementById("yml-upload").click();
  }, []);

  const uploadYML = useCallback((event) => {
    const file = event.target.files[0];
    let fileName = file.name.split(".").slice(0, -1).join(".");
    const reader = new FileReader();
    reader.onload = function (event) {
      const text = event.target.result;
      const flow = readYaml(fileName, text);
      if (!flow) {
        return;
      }
      resetFlow(flow.nodes, flow.edges);
    };
    if (file) {
      reader.readAsText(file);
    }
    event.target.value = "";
  }, []);

  /* Screenshot */

  const onScreenshot = useCallback(() => {
    const nodesBounds = getRectOfNodes(getNodes());
    const targetScale = 1;
    const targetWidth = nodesBounds.width * targetScale;
    const targetHeight = nodesBounds.height * targetScale;

    const transform = getTransformForBounds(
      nodesBounds,
      targetWidth,
      targetHeight,
      0.5,
      2
    );
    toJpeg(document.querySelector(".react-flow__viewport"), {
      backgroundColor: "#ffffff",
      quality: 0.95,
      width: targetWidth,
      height: targetHeight,
      style: {
        width: targetWidth,
        height: targetHeight,
        transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
      },
    }).then(downloadImage);
  }, []);

  /* Auto Layout */

  const onAutoLayout = useCallback(() => {
    const obj = autoLayout(nodes, edges);
    if (!obj) {
      return;
    }
    const objCopy = JSON.parse(JSON.stringify(obj));
    resetFlow(objCopy.nodes, objCopy.edges);
  }, [nodes, edges]);

  /* Auto create new node and edge */

  let connectingParams = useRef(null);

  const onConnectStart = useCallback((_, params) => {
    connectingParams.nodeId = params.nodeId;
    connectingParams.handleId = params.handleId;
  }, []);

  const onConnectEnd = useCallback(
    (event) => {
      const targetIsPane = event.target.classList.contains("react-flow__pane");
      const { top, left } = flowWrapper.current.getBoundingClientRect();

      if (!targetIsPane) {
        return;
      }
      if (connectingParams.handleId == "handleIn") {
        return;
      }

      const hitPosition = project({
        x: event.clientX - left,
        y: event.clientY - top,
      });
      const safeSpace = 20;
      for (let i = 0; i < nodes.length; i++) {
        let node = nodes[i];
        if (
          hitPosition.x > node.position.x - safeSpace &&
          hitPosition.y > node.position.y - safeSpace &&
          hitPosition.x < node.position.x + node.width + safeSpace &&
          hitPosition.y < node.position.y + node.height + safeSpace
        ) {
          return;
        }
      }

      const fromNode = getNode(connectingParams.nodeId);
      if (!fromNode) {
        return;
      }
      let type = "npcNode";
      if (fromNode["type"] == "startNode") {
        type = "npcNode";
      } else if (fromNode["type"] == "npcNode") {
        if (connectingParams.handleId == "handleOut") {
          type = "playerNode";
        } else {
          type = "npcNode";
        }
      } else {
        type = "npcNode";
      }

      const newNodeID = getNewNodeID();
      const newNode = {
        id: newNodeID,
        type,
        position: { x: hitPosition.x - 100, y: hitPosition.y },
        data: { name: `${newNodeID}` },
      };

      setNodes((nds) => nds.concat(newNode));

      const newLineID = getNewLineID();
      let edge = {};
      edge["id"] = newLineID;
      edge["type"] = "step";
      edge["markerEnd"] = { type: MarkerType.ArrowClosed };
      edge["source"] = connectingParams.nodeId;
      edge["sourceHandle"] = connectingParams.handleId;
      edge["target"] = newNodeID;
      edge["targetHandle"] = "handleIn";

      const newEdges = removeLinesOnConnect(
        fromNode,
        edges,
        connectingParams.nodeId,
        connectingParams.nodeId,
        connectingParams.handleId
      );
      setEdges(addEdge(edge, newEdges));
    },
    [project, nodes, getNode, flowWrapper, edges]
  );

  return (
    <div className="flow-container">
      <input
        type="file"
        id="json-upload"
        onChange={uploadJSON}
        style={{ display: "none" }}
      />
      <input
        type="file"
        id="yml-upload"
        onChange={uploadYML}
        className="download-btn"
        style={{ display: "none" }}
      />

      <div className="flow-wrapper" ref={flowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onInit={setReactFlowInstance}
          connectionLineComponent={ConnectionLine}
          minZoom={0.5}
          maxZoom={1.5}
          fitView
        >
          <MiniMap
            nodeStrokeColor={(n) => {
              return "#0041d0";
            }}
            nodeColor={(n) => {
              return "#fff";
            }}
            className="minimap"
          />

          <Panel position="top-right" className="panel">
            <button onClick={onRestore} className="debug-button">
              Cache: Restore
            </button>
            <button onClick={onSave} className="debug-button">
              Cache: Save
            </button>
            <button onClick={onUploadJSON} className="debug-button">
              DEBUG: Upload
            </button>
            <button onClick={onDownloadJSON} className="debug-button">
              DEBUG: Download
            </button>
            <button onClick={onClear} className="clear-button">
              Clear all
            </button>
            <button onClick={onAutoLayout} className="user-button">
              Auto Layout
            </button>
            <button onClick={onScreenshot} className="user-button">
              Screenshot
            </button>
            <button onClick={onUploadYML} className="user-button">
              yml: Upload
            </button>
            <button onClick={onDownloadYML} className="user-button">
              yml: Download
            </button>
          </Panel>

          <Background variant="lines" />
        </ReactFlow>
      </div>
    </div>
  );
};

export default () => (
  <ReactFlowProvider>
    <MyFlowView />
  </ReactFlowProvider>
);
