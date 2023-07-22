import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
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
import ELK from 'elkjs/lib/elk.bundled.js';
import { toJpeg } from 'html-to-image';
import { parseYaml } from './parseYaml';
import { encodeYaml } from './writeYaml';

import ConditionNode from './nodes/ConditionNode';
import NoteNode from './nodes/NoteNode';
import NPCNode from './nodes/NPCNode';
import PlayerNode from './nodes/PlayerNode';
import StartNode from './nodes/StartNode';

import Sidebar from './Sidebar';

const elk = new ELK();

const elkOptions = {
  'elk.algorithm': 'layered',
  'elk.layered.spacing.nodeNodeBetweenLayers': '50',
  'elk.spacing.nodeNode': '50',
  'elk.direction': 'DOWN',
};

const initBgColor = '#1A192B';

const flowKey = 'bq-flow';
const testKey = 'bq-test';

let id = 0;
const getId = () => `dndnode_${id++}`;

const nodeTypes = {
  conditionNode: ConditionNode,
  noteNode: NoteNode,
  npcNode: NPCNode,
  playerNode: PlayerNode,
  startNode: StartNode,
};

const getLayoutedElements = async (nodes, edges, options = {}) => {
  const graph = {
    id: 'root',
    layoutOptions: options,
    children: nodes.map((node) => ({
      ...node,

      targetPosition: 'top',
      sourcePosition: 'bottom',

      width: node.width,
      height: node.height,
    })),
    edges: edges,
  };
  
  return elk
    .layout(graph)
    .then((layoutedGraph) => ({
      nodes: layoutedGraph.children.map((node) => ({
        ...node,
        position: { x: node.x, y: node.y },
      })),

      edges: layoutedGraph.edges,
    }))
    .catch(console.error);
};

function downloadImage(dataUrl) {
  const a = document.createElement('a');

  a.setAttribute('download', 'reactflow.jpg');
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

function downloadYML(result) {
  if (!result) {
    return;
  }
  let name = result[0];
  let yml = result[1];
  const blob = new Blob([yml], { type: 'application/yml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${name}.yml`;
  link.click();
  URL.revokeObjectURL(url);
}



const SaveRestore = () => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const { setViewport, getNodes, fitView } = useReactFlow();

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const [needsLayout, setNeedsLayout] = useState(false);

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
        data: {},
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );

  const onSave = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      const json = JSON.stringify(flow);
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

  const onDownloadYML = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      // encodeYaml(flow)
      // console.log(encodeYaml(flow))
      downloadYML(encodeYaml(flow));
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
        // console.log(flow);
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    };

    reader.readAsText(file);
  };

  const onUploadYML = () => {
    document.getElementById('yml-upload').click();
  };

  const uploadYML = (event) => {
    const file = event.target.files[0];

    const reader = new FileReader();
    reader.onload = function (event) {
      const text = event.target.result;
      const flow = parseYaml(text);

      if (flow) {
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
      }
      setTimeout(() => {
        setNeedsLayout(true)
      }, 0);


    };
    if (file) {
      reader.readAsText(file);
    }
  };
  useEffect(() => {
    if (needsLayout) {
      onELKLayout();
      setNeedsLayout(false);
    }
  }, [needsLayout]);
  const onScreenshot = () => {
    // we calculate a transform for the nodes so that all nodes are visible
    // we then overwrite the transform of the `.react-flow__viewport` element
    // with the style option of the html-to-image library
    const nodesBounds = getRectOfNodes(getNodes());
    const targetScale = 1
    const targetWidth = nodesBounds.width * targetScale
    const targetHeight = nodesBounds.height * targetScale

    const transform = getTransformForBounds(nodesBounds, targetWidth, targetHeight, 0.5, 2);
    // console.log(transform[2])
    toJpeg(document.querySelector('.react-flow__viewport'), {
      backgroundColor: '#ffffff',
      quality: 0.95,
      width: targetWidth,
      height: targetHeight,
      style: {
        width: targetWidth,
        height: targetHeight,
        transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
      },
    }).then(downloadImage);
  };

  // test ------------------------

  const onELKLayout = () => {
    getLayoutedElements(nodes, edges, elkOptions).then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);

      setTimeout(() => {
        window.requestAnimationFrame(() => fitView());
      }, 0);

    });
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
            <div>
              <button onClick={onDownloadYML} className="download-btn">download-yml</button>
            </div>
            <div>
              <input
                type="file"
                id="yml-upload"
                onChange={uploadYML}
                className="download-btn"
                style={{ display: 'none' }}
              />
              <button onClick={onUploadYML} className="download-btn">upload-yml</button>
            </div>
            <div>
              <button onClick={onELKLayout} className="download-btn">ELKLayout</button>
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
