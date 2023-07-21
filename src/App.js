import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Panel,
  useReactFlow,
  getRectOfNodes,
  getTransformForBounds,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toPng } from 'html-to-image';

import ConditionNode from './nodes/ConditionNode';
import NoteNode from './nodes/NoteNode';
import NPCNode from './nodes/NPCNode';
import PlayerNode from './nodes/PlayerNode';
import StartNode from './nodes/StartNode';

import Sidebar from './Sidebar';

const initBgColor = '#1A192B';

const flowKey = 'bq-flow';

const imageWidth = 1024;
const imageHeight = 768;

let id = 0;
const getId = () => `dndnode_${id++}`;

const nodeTypes = {
  conditionNode: ConditionNode,
  noteNode: NoteNode,
  npcNode: NPCNode,
  playerNode: PlayerNode,
  startNode: StartNode,
};

function downloadImage(dataUrl) {
  const a = document.createElement('a');

  a.setAttribute('download', 'reactflow.png');
  a.setAttribute('href', dataUrl);
  a.click();
}

function downloadJSON(json) {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'data.json';
  link.click();
  URL.revokeObjectURL(url);
}



const SaveRestore = () => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const { setViewport, getNodes } = useReactFlow();

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
      const json = JSON.stringify(flow);
      console.log(json)
      localStorage.setItem(flowKey, json);
      // downloadJSON(json);
    }
  }, [reactFlowInstance]);

  const onDownload = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      const json = JSON.stringify(flow);
      downloadJSON(json);
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

  const onUploadJSON = () => {
    // 当用户点击按钮时，触发 input 元素的点击事件
    document.getElementById('json-upload').click();
  };

  const uploadJSON = (event) => {
    const file = event.target.files[0];

    const reader = new FileReader();
    reader.onload = function (event) {
      const text = event.target.result;
      try {
        const flow = JSON.parse(text);
        if (flow) {
          const { x = 0, y = 0, zoom = 1 } = flow.viewport;
          setNodes(flow.nodes || []);
          setEdges(flow.edges || []);
          setViewport({ x, y, zoom });
        }
        console.log(flow);
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    };

    reader.readAsText(file);
  };

  const onScreenshot = () => {
    // we calculate a transform for the nodes so that all nodes are visible
    // we then overwrite the transform of the `.react-flow__viewport` element
    // with the style option of the html-to-image library
    const nodesBounds = getRectOfNodes(getNodes());
    const transform = getTransformForBounds(nodesBounds, imageWidth, imageHeight, 0.5, 2);

    toPng(document.querySelector('.react-flow__viewport'), {
      backgroundColor: '#1a365d',
      width: imageWidth,
      height: imageHeight,
      style: {
        width: imageWidth,
        height: imageHeight,
        transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
      },
    }).then(downloadImage);
  };

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
            <div>
              <button onClick={onSave} className="download-btn">save</button>
            </div>
            <button onClick={onRestore} className="download-btn">restore</button>
            <div>
              <button onClick={onScreenshot} className="download-btn">screenshot</button>
            </div>
            <div>
              <button onClick={onDownload} className="download-btn">download-json</button>
            </div>
            <div>
              <input
                type="file"
                id="json-upload"
                onChange={uploadJSON}
                className="download-btn"
                style={{ display: 'none' }}
              />
              <button onClick={onUploadJSON} className="download-btn">upload-json</button>
            </div>
          </Panel>
        </ReactFlow>
      </div>

    </div >
  );
};

export default () => (
  <ReactFlowProvider>
    <SaveRestore />
  </ReactFlowProvider>
);
