import React, { useState, useEffect, useRef, useCallback } from 'react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';
import './styles.css'

import { toJpeg } from 'html-to-image';
import { autoLayout } from '../utils/autoLayout';

import { readYaml } from '../utils/readYaml';
import { writeYaml } from '../utils/writeYaml';

import NoteNode from '../nodes/NoteNode';
import NPCNode from '../nodes/NPCNode';
import PlayerNode from '../nodes/PlayerNode';
import StartNode from '../nodes/StartNode';
import ButtonEdge from '../nodes/ButtonEdge';

import ConnectionLine from '../utils/ConnectionLine.js';

const edgeTypes = {
  buttonedge: ButtonEdge,
};

const flowKey = 'bq-flow';

let id = 0;
const getId = () => `node_${id++}`;

const nodeTypes = {
  noteNode: NoteNode,
  npcNode: NPCNode,
  playerNode: PlayerNode,
  startNode: StartNode,
};

function initialNodes() {
  let id = getId()

  const newNode = {
    id: id,
    type: 'startNode',
    position: { x: 0, y: 0 },
    data: { 'name': `${id}` },
  };
  return [newNode]
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
  const flowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const { setViewport, getNode, getNodes, fitView, project } = useReactFlow();

  const onConnect = useCallback((params) => {
    params['type'] = 'step'
    params['markerEnd'] = { type: MarkerType.ArrowClosed }
    let source = params['source']
    let node = getNode(source)
    let edges2 = edges
    if (node.type == 'startNode') {
      edges2 = edges.filter((item, i) => {
        return item['source'] != source
      });
    }
    if (node.type == 'playerNode') {
      edges2 = edges.filter((item, i) => {
        return item['source'] != connectingParams.nodeId
      });
    }

    edges2 = addEdge(params, edges2)
    setEdges(edges2)
  }, [edges]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const [needsLayout, setNeedsLayout] = useState(false);

  const cmdAndSPressed = useKeyPress(['Delete']);

  const deleteSelectedNodes = useCallback(() => {
    let nodes2 = nodes.filter((item, i) => {
      return item.selected != true
    });
    let edges2 = edges.filter((item, i) => {
      return item.selected != true
    });
    setNodes(nodes2)
    setEdges(edges2)
  }, [nodes, edges]);

  useEffect(() => {
    deleteSelectedNodes();
  }, [cmdAndSPressed]);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = flowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      let id = getId()
      while (getNode(id)) {
        id = getId()
      }
      const newNode = {
        id: id,
        type,
        position,
        data: { 'name': `${id}` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );

  const onClear = useCallback(() => {
    setEdges([]);
    setNodes(initialNodes());
    window.requestAnimationFrame(() => fitView());
  }, [reactFlowInstance]);

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
      // console.log(window.myGlobalVariable)
      downloadYML(writeYaml(flow));
    }
  }, [reactFlowInstance]);

  const onRestore = useCallback(() => {
    const restoreFlow = async () => {
      const flow = JSON.parse(localStorage.getItem(flowKey));

      if (flow) {
        setEdges([])
        setNodes([])

        setTimeout(() => {
          // window.requestAnimationFrame(() => fitView());

          const { x = 0, y = 0, zoom = 1 } = flow.viewport;
          setNodes(flow.nodes || []);
          setEdges(flow.edges || []);
          setViewport({ x, y, zoom });
        }, 0);

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
      const flow = readYaml(text);

      if (flow) {
        // console.log(flow);
        setEdges([]);
        setNodes([]);
        window.requestAnimationFrame(() => fitView());

        setTimeout(() => {
          // let obj = autoLayout(flow.nodes, flow.edges)
          setNodes(flow.nodes || []);
          setEdges(flow.edges || []);
          // setTimeout(() => {
          //   setNeedsLayout(true)
          // }, 100);
        }, 100);
      }
      // setTimeout(() => {
      //   setNeedsLayout(true)
      // }, 1000);


    };
    if (file) {
      reader.readAsText(file);
    }
  };
  useEffect(() => {
    if (needsLayout) {
      onAutoLayout();
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

  const onAutoLayout = useCallback(() => {
    // console.log(getNodes())
    // window.requestAnimationFrame(() => fitView());

    // getLayoutedElements(getNodes(), edges, elkOptions).then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
    //   setNodes(layoutedNodes);
    //   setEdges(layoutedEdges);
    // const p = {}
    // p.x = 0
    // p.y = 0
    // p.zoom = 1
    // setViewport(p);

    //   setTimeout(() => {
    //     window.requestAnimationFrame(() => fitView());
    //   }, 0);

    // });
    let obj = autoLayout(nodes, edges)
    if (!obj) {
      return
    }
    let newNodes = obj.nodes
    let newEdges = obj.edges


    setNodes(JSON.parse(JSON.stringify(newNodes)));
    setEdges(newEdges);
    const p = {}
    p.x = 0
    p.y = 0
    p.zoom = 1
    setViewport(p)
    // console.log(newNodes)
    window.requestAnimationFrame(() => fitView());




  }, [nodes, edges]);


  let connectingParams = useRef(null);

  const onConnectStart = useCallback((_, params) => {
    connectingParams.nodeId = params.nodeId;
    connectingParams.handleId = params.handleId;
  }, []);

  const onConnectEnd = useCallback(
    (event) => {
      const targetIsPane = event.target.classList.contains('react-flow__pane');
      const { top, left } = flowWrapper.current.getBoundingClientRect();

      if (!targetIsPane) {
        return
      }
      if (connectingParams.handleId == 'handleIn') {
        return
      }

      let hitPosition = project({ x: event.clientX - left, y: event.clientY - top })
      let safeSpace = 10
      for (let i = 0; i < nodes.length; i++) {
        let node = nodes[i]
        if (hitPosition.x > node.position.x - safeSpace &&
          hitPosition.y > node.position.y - safeSpace &&
          hitPosition.x < node.position.x + node.width + safeSpace &&
          hitPosition.y < node.position.y + node.height + safeSpace) {

          return
        }
      }


      const fromNode = getNode(connectingParams.nodeId)
      if (!fromNode) {
        return
      }
      // console.log(fromNode, connectingParams)
      let type = 'npcNode';
      if (fromNode['type'] == 'startNode') {
        type = 'npcNode';
      } else if (fromNode['type'] == 'npcNode') {
        if (connectingParams.handleId == 'handleOut') {
          type = 'playerNode'
        } else {
          type = 'npcNode'
        }
      } else {
        type = 'npcNode';
      }



      let id = getId()
      while (getNode(id)) {
        id = getId()
      }
      const newNode = {
        id: id,
        type,
        position: { x: hitPosition.x - 100, y: hitPosition.y },
        data: { 'name': `${id}` },
      };

      setNodes((nds) => nds.concat(newNode));


      while (getNode(id)) {
        id = getId()
      }
      let edge = {}
      edge['id'] = id
      edge['type'] = 'step'
      edge['markerEnd'] = { type: MarkerType.ArrowClosed }
      edge['source'] = connectingParams.nodeId
      edge['sourceHandle'] = connectingParams.handleId
      edge['target'] = id
      edge['targetHandle'] = 'handleIn'

      let edges2 = edges
      if (fromNode.type == 'startNode') {
        edges2 = edges.filter((item, i) => {
          return item['source'] != connectingParams.nodeId
        });
      }
      if (fromNode.type == 'playerNode') {
        edges2 = edges.filter((item, i) => {
          return item['source'] != connectingParams.nodeId
        });
      }


      edges2 = addEdge(edge, edges2)
      setEdges(edges2)
    },
    [project, nodes, flowWrapper, edges]
  );

  const connectionLineComponent = (e) => {
    return React.Component()
  }

  return (
    <div className="flow-container">

      <input
        type="file"
        id="json-upload"
        onChange={uploadJSON}
        style={{ display: 'none' }}
      />
      <input
        type="file"
        id="yml-upload"
        onChange={uploadYML}
        className="download-btn"
        style={{ display: 'none' }}
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
          onDrop={onDrop}
          onDragOver={onDragOver}
          edgeTypes={edgeTypes}
          connectionLineComponent={ConnectionLine}
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

          <Panel position="top-right" className='panel'>
            <button onClick={onRestore} className="debug-button">Cache: Restore</button>
            <button onClick={onSave} className="debug-button">Cache: Save</button>
            <button onClick={onUploadJSON} className="debug-button">DEBUG: Upload</button>
            <button onClick={onDownload} className="debug-button">DEBUG: Download</button>
            <button onClick={onClear} className="user-button">Clear all</button>
            <button onClick={onAutoLayout} className="user-button">Auto Layout</button>
            <button onClick={onScreenshot} className="user-button">Screenshot</button>
            <button onClick={onUploadYML} className="user-button">yml: Upload</button>
            <button onClick={onDownloadYML} className="user-button">yml: Download</button>
          </Panel>

          <Background variant="lines" />
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
