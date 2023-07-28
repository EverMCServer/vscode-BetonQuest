import {
  useState,
  useRef,
  useCallback,
  MouseEvent as ReactMouseEvent,
  TouchEvent as ReactTouchEvent,
} from "react";
import * as React from "react";
import {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  MiniMap,
  useReactFlow,
  MarkerType,
  Background,
  Node,
  Edge,
  BackgroundVariant,
  Connection,
  OnConnectStartParams,
  Viewport,
} from "reactflow";
import ReactFlow from "reactflow";
import "reactflow/dist/style.css";
import "./styles.css";
import FlowPanel from "./FlowPanel";

import { initialNode, removeLinesOnConnect } from "../utils/commonUtils";

import NPCNode from "../nodes/NPCNode";
import PlayerNode from "../nodes/PlayerNode";
import StartNode from "../nodes/StartNode";
import ConnectionLine from "../nodes/ConnectionLine";
import ContextMenu from "../nodes/ContextMenu";

import { vscode } from "../utils/vscode";
import { readYaml } from "../utils/readYaml";
import { autoLayout } from "../utils/autoLayout";

const nodeTypes = {
  npcNode: NPCNode,
  playerNode: PlayerNode,
  startNode: StartNode,
};

const MyFlowView: React.FC = () => {
  const flowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([initialNode]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { getNode, getEdge, project, setViewport, fitView } = useReactFlow();

  /* ID counter */

  let lineID = 1;
  const getNewLineID = useCallback(() => {
    while (getEdge(`line_${lineID}`)) {
      lineID++;
    }
    return `line_${lineID}`;
  }, [getEdge, lineID]);

  let nodeID = 1;
  const getNewNodeID = useCallback(() => {
    while (getNode(`node_${nodeID}`)) {
      nodeID++;
    }
    return `node_${nodeID}`;
  }, [getNode, nodeID]);

  /* Menu */

  const [menu, setMenu] = useState<any>(null);
  const onNodeContextMenu = useCallback(
    (event: ReactMouseEvent, node: Node) => {
      event.preventDefault();

      const wrapper = flowWrapper.current;
      if (!wrapper) {
        return;
      }
      const pane = wrapper.getBoundingClientRect();

      setMenu({
        id: node.id,
        top: event.clientY < pane.height - 200 && event.clientY,
        left: event.clientX < pane.width - 200 && event.clientX,
        right: event.clientX >= pane.width - 200 && pane.width - event.clientX,
        bottom:
          event.clientY >= pane.height - 200 && pane.height - event.clientY,
      });
    },
    [setMenu]
  );
  const onPaneClick = useCallback(() => setMenu(null), [setMenu]);

  /* Remove unsupport lines */

  const onConnect = useCallback(
    (params: Connection) => {
      if (!params) {
        return;
      }
      const sourceID = params["source"] || "";
      let sourceNode = getNode(sourceID);
      if (!sourceNode) {
        return;
      }

      let edge: Edge = {
        id: getNewLineID(),
        type: "step",
        markerEnd: { type: MarkerType.ArrowClosed },
        source: params.source || "",
        sourceHandle: params.sourceHandle || "",
        target: params.target || "",
        targetHandle: params.targetHandle || "",
      };

      const newEdges = removeLinesOnConnect(
        sourceNode,
        edges,
        sourceID,
        params["sourceHandle"] || ""
      );

      setEdges(addEdge(edge, newEdges || []));
    },
    [edges, getNewLineID, getNode, setEdges]
  );

  /* Auto create new node and edge */

  type ConnectParams = {
    nodeId: string | null;
    handleId: string | null;
  };

  const connectingParams = useRef<ConnectParams>({
    nodeId: null,
    handleId: null,
  });

  const onConnectStart = useCallback(
    (
      event: ReactMouseEvent | ReactTouchEvent,
      params: OnConnectStartParams
    ) => {
      event.preventDefault();
      connectingParams.current.nodeId = params.nodeId;
      connectingParams.current.handleId = params.handleId;
    },
    []
  );

  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent) => {
      event.preventDefault();
      if (!event) {
        return;
      }
      if (event instanceof TouchEvent) {
        return;
      }
      const targetIsPane = (event.target as any).classList.contains(
        "react-flow__pane"
      );
      const wrapper = flowWrapper.current;
      if (!wrapper) {
        return;
      }
      const { top, left } = wrapper.getBoundingClientRect();

      if (!targetIsPane) {
        return;
      }
      if (connectingParams.current.handleId === "handleIn") {
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
          hitPosition.x < node.position.x + (node.width || 0) + safeSpace &&
          hitPosition.y < node.position.y + (node.height || 0) + safeSpace
        ) {
          return;
        }
      }

      const fromNode = getNode(connectingParams.current.nodeId || "");
      if (!fromNode) {
        return;
      }
      let type = "npcNode";
      if (fromNode["type"] === "startNode") {
        type = "npcNode";
      } else if (fromNode["type"] === "npcNode") {
        if (connectingParams.current.handleId === "handleOut") {
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
      let edge: Edge = {
        id: newLineID,
        type: "step",
        markerEnd: { type: MarkerType.ArrowClosed },
        source: connectingParams.current.nodeId || "",
        sourceHandle: connectingParams.current.handleId,
        target: newNodeID,
        targetHandle: "handleIn",
      };

      const newEdges = removeLinesOnConnect(
        fromNode,
        edges,
        connectingParams.current.nodeId || "",
        connectingParams.current.handleId || ""
      );

      setEdges(addEdge(edge, newEdges));
    },
    [
      project,
      getNode,
      getNewNodeID,
      setNodes,
      getNewLineID,
      edges,
      setEdges,
      nodes,
    ]
  );

  const [yml, setYml] = React.useState("");

  React.useEffect(() => {
    // notify vscode when webview startup completed.
    vscode.postMessage({
      type: "webview-lifecycle",
      content: "started",
    });
    // Listen from extension message (document update etc)
    window.addEventListener("message", (event) => {
      const message = event.data; // JSON

      switch (message.type) {
        case "update":
          if (message.content !== yml) {
            // Avoid duplicated update
            console.log("update yml ...");
            setYml(message.content);

            const flow = readYaml("fileName", message.content as string);
            if (!flow) {
              return;
            }

            const obj = autoLayout(flow.nodes, flow.edges);
            if (!obj) {
              return;
            }
            const objCopy = JSON.parse(JSON.stringify(obj));
            resetFlow(objCopy.nodes, objCopy.edges);

            break;
          }
          console.log("update yml ... nothing changed.");
          break;
      }
    });
  }, []);

  React.useEffect(() => {
    const handleKeyUp = (event: KeyboardEvent) => {};

    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const resetFlow = useCallback(
    async (nodes: Node[], edges: Edge[], viewport?: Viewport) => {
      // setEdges([]);
      // setNodes([]);
      setViewport({ x: 0, y: 0, zoom: 1 });

      setTimeout(() => {
        setNodes(nodes || []);
        setEdges(edges || []);

        // setViewport(viewport);
      }, 100);
    },
    [fitView, setEdges, setNodes, setViewport]
  );

  return (
    <div className="flow-container">
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
          connectionLineComponent={ConnectionLine}
          fitView
          minZoom={0.5}
          maxZoom={1.5}
          snapToGrid={true}
          onNodeContextMenu={onNodeContextMenu}
          onPaneClick={onPaneClick}
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
          <FlowPanel />

          <Background variant={BackgroundVariant.Dots} />
          {menu && <ContextMenu onClick={onPaneClick} {...menu} />}
        </ReactFlow>
      </div>
    </div>
  );
};

export const MyFlowViewProvider: React.FC = () => (
  <ReactFlowProvider>
    <MyFlowView />
  </ReactFlowProvider>
);
export default MyFlowViewProvider;
