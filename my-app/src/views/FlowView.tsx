import React, {
  useState,
  useRef,
  useCallback,
  MouseEvent as ReactMouseEvent,
  TouchEvent as ReactTouchEvent,
} from "react";
import ReactFlow, {
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
} from "reactflow";
import "reactflow/dist/style.css";
import "./styles.css";
import FlowPanel from "./FlowPanel";

import { initialNode, removeLinesOnConnect } from "../utils/commonUtils";

import NPCNode from "../nodes/NPCNode";
import PlayerNode from "../nodes/PlayerNode";
import StartNode from "../nodes/StartNode";
import ConnectionLine from "../nodes/ConnectionLine";
import ContextMenu from "../nodes/ContextMenu";

const nodeTypes = {
  npcNode: NPCNode,
  playerNode: PlayerNode,
  startNode: StartNode,
};

const MyFlowView: React.FC = () => {
  const flowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([initialNode]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { getNode, getEdge, project } = useReactFlow();

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
