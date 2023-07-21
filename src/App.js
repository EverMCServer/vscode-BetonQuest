import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Panel,
  useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';

import ConditionNode from './nodes/ConditionNode';
import NoteNode from './nodes/NoteNode';
import NPCNode from './nodes/NPCNode';
import PlayerNode from './nodes/PlayerNode';
import StartNode from './nodes/StartNode';

import Sidebar from './Sidebar';

const initBgColor = '#1A192B';

const flowKey = 'bq-flow';

let id = 0;
const getId = () => `dndnode_${id++}`;

const nodeTypes = {
  conditionNode: ConditionNode,
  noteNode: NoteNode,
  npcNode: NPCNode,
  playerNode: PlayerNode,
  startNode: StartNode,
};

const SaveRestore = () => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const { setViewport } = useReactFlow();

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  useEffect(() => {
    setNodes([
      {
        id: '2',
        type: 'npcNode',
        data: { color: initBgColor },
        style: { padding: 5 },
        position: { x: 300, y: 50 },
      },
    ]);


  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      const newNode = {
        id: getId(),
        type,
        position,
        style: { padding: 5 },
        data: { label: `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );

  const onSave = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      console.log(JSON.stringify(flow))
      localStorage.setItem(flowKey, JSON.stringify(flow));
    }
  }, [reactFlowInstance]);

  const onRestore = useCallback(() => {
    const restoreFlow = async () => {
      const flow = JSON.parse(localStorage.getItem(flowKey));

      if (flow) {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport;
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
        setViewport({ x, y, zoom });
      }
    };

    restoreFlow();
  }, [setNodes, setViewport]);

  return (
    <div className="dndflow">
      <Sidebar />

        <div className="reactflow-wrapper" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView
          >
            <MiniMap
              nodeStrokeColor={(n) => {
                return '#0041d0';
              }}
              nodeColor={(n) => {
                return '#fff';
              }}
            />
            <Panel position="top-right">
              <button onClick={onSave}>save</button>
              <button onClick={onRestore}>restore</button>
            </Panel>
          </ReactFlow>
        </div>

    </div>
  );
};

export default () => (
  <ReactFlowProvider>
    <SaveRestore />
  </ReactFlowProvider>
);
