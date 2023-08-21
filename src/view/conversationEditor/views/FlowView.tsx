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
  // MiniMap,
  useReactFlow,
  MarkerType,
  Background,
  Node,
  Edge,
  BackgroundVariant,
  Connection,
  OnConnectStartParams,
  Viewport,
  useKeyPress,
  // getRectOfNodes,
  // getTransformForBounds,
  Panel,
  useViewport,
  useOnSelectionChange,
} from "reactflow";
import ReactFlow from "reactflow";
import "reactflow/dist/style.css";
import "./styles.css";

import {
  // downloadFile,
  // downloadImage,
  initialNode,
  removeLinesOnConnect,
} from "../utils/commonUtils";

import NPCNode from "../nodes/NPCNode";
import PlayerNode from "../nodes/PlayerNode";
import StartNode from "../nodes/StartNode";
import ConnectionLine from "../nodes/ConnectionLine";
import ContextMenu from "../nodes/ContextMenu";

import { vscode } from "../utils/vscode";
import { readYaml } from "../utils/readYaml";
import { autoLayout } from "../utils/autoLayout";
import { toJpeg } from "html-to-image";
import { writeYaml } from "../utils/writeYaml";
import ConversationYamlModel, { ConversationYamlOptionModel, IConversationYamlOptionModel, TextMultilingualModel } from "../utils/conversationYamlModel";
import TranslationSelector from "../components/TranslationSelector";

const cacheKey = "bq-flow";

const nodeTypes = {
  npcNode: NPCNode,
  playerNode: PlayerNode,
  startNode: StartNode,
};

// Global variables from vscode
declare global {
  var initialConfig: {
    translationSelection?: string; // Conversation YAML's translation selection.
  };
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function MyFlowView() {
  const flowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([initialNode]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const viewport = useViewport();
  const {
    getNode,
    getNodes,
    getEdge,
    getEdges,
    project,
    setViewport,
    fitView,
  } = useReactFlow();

  // Cache translation selection
  const [translationSelection, setTranslationSelection] = useState(globalThis.initialConfig.translationSelection);

  // Caching multilingual status
  let isYamlMultilingual = false;

  // Caching rendered Yaml, prevent unnecessary rendering
  let cachedYml = "";

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

      // Check parent node uses multilingual text or not.
      // The newly created node should follows the parent's multilingual behaviour.
      let isMultilingual = false;
      if (fromNode.data["translationSelection"] && fromNode.data["translationSelection"].length > 0){
        isMultilingual = true;
      }
      const newNodeOption: IConversationYamlOptionModel = {};
      if (isMultilingual) {
        newNodeOption.text = {[fromNode.data["translationSelection"]]: ""} as TextMultilingualModel;
      } else {
        newNodeOption.text = "";
      }
      console.log("new node is multilingual:", Object.assign(new ConversationYamlOptionModel(), newNodeOption).isTextMultilingual());

      const newNodeID = getNewNodeID();
      const newNode = {
        id: newNodeID,
        type,
        position: { x: hitPosition.x - 100, y: hitPosition.y },
        data: { name: `${newNodeID}` , option: newNodeOption, translationSelection: fromNode.data["translationSelection"] },
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

  /* Reset Flow */

  const resetFlow = useCallback(
    async (nodes: Node[], edges: Edge[], viewport?: Viewport) => {
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
    },
    [fitView, setEdges, setNodes, setViewport]
  );

  // Public method to update flowchart contents
  let updateFlowChart = (fileName: string, content: string, translationSelection?: string) => {
    const flow = readYaml(fileName, content, translationSelection || "en");
      if (!flow) {
        return;
      }

      const obj = autoLayout(flow.nodes, flow.edges);
      if (!obj) {
        return;
      }
      const objCopy = JSON.parse(JSON.stringify(obj));
      resetFlow(objCopy.nodes, objCopy.edges);
  };

  /* DEL keyboard button event */

  const deleteButtonPressed = useKeyPress(["Delete"]);
  const deleteSelectedNodes = useCallback(() => {
    const nodes2 = getNodes().filter((item, i) => {
      return item.selected !== true;
    });
    const edges2 = getEdges().filter((item, i) => {
      return item.selected !== true;
    });
    setNodes(nodes2);
    setEdges(edges2);
  }, [getNodes, getEdges, setNodes, setEdges]);

  React.useEffect(() => {
    deleteSelectedNodes();
  }, [deleteButtonPressed]);

  /* Clear event */

  // const onClear = useCallback(() => {
  //   setEdges([]);
  //   setNodes([initialNode]);
  //   window.requestAnimationFrame(() => fitView());
  // }, [fitView, setEdges, setNodes]);

  // /* DEBUG Save/Restore event */

  // const onSave = useCallback(() => {
  //   let dict = {
  //     nodes: getNodes(),
  //     edges: getEdges(),
  //     viewport: viewport,
  //   };
  //   const json = JSON.stringify(dict);
  //   localStorage.setItem(cacheKey, json);
  // }, [getNodes, getEdges, viewport]);

  // const onRestore = useCallback(() => {
  //   const item = localStorage.getItem(cacheKey) as string;
  //   const flow = JSON.parse(item);
  //   if (!flow) {
  //     return;
  //   }
  //   resetFlow(flow.nodes, flow.edges, flow.viewport);
  // }, [resetFlow]);

  // /* DEBUG Download/Upload event */

  // const onDownloadJSON = useCallback(() => {
  //   let dict = {
  //     nodes: getNodes(),
  //     edges: getEdges(),
  //     viewport: viewport,
  //   };
  //   const json = JSON.stringify(dict);
  //   downloadFile("debug.json", json, "json");
  // }, [getNodes, getEdges, viewport]);

  // const onUploadJSON = useCallback(() => {
  //   const ele = document.getElementById("json-upload");
  //   if (ele) {
  //     ele.click();
  //   }
  // }, []);

  // const uploadJSON = useCallback(
  //   (event: React.ChangeEvent<HTMLInputElement>) => {
  //     if (!event.target.files) {
  //       return;
  //     }
  //     const file = event.target.files[0];
  //     const reader = new FileReader();
  //     reader.onload = function () {
  //       const text = reader.result;
  //       const flow = JSON.parse(text as string);
  //       if (!flow) {
  //         return;
  //       }
  //       resetFlow(flow.nodes, flow.edges, flow.viewport);
  //     };
  //     if (file) {
  //       reader.readAsText(file);
  //     }
  //     event.target.value = "";
  //   },
  //   [resetFlow]
  // );

  /* Update Yaml content when user modified the flowchart */

  React.useEffect(() => {

    const ignoreKeys = ["Control", "Meta", "Shift", "Alt", "Tab", "CapsLock", "ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"];
    let timeoutHandler: number;

    const handleKeyUp = (e: KeyboardEvent) => {

      // Skip certain keys
      if (
        ignoreKeys.includes(e.key) ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // Prevent Yaml update if a user is still typing.
      window.clearTimeout(timeoutHandler);

      // Delayed Yaml update.
      timeoutHandler = window.setTimeout(()=>{
        // Update
        onDownloadYML();
      }, 1000);

    };

    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  React.useEffect(() => {
    console.log("new window");
  }, []);

  /* YML Download/Upload event */

  const onDownloadYML = useCallback(() => {
    const data = writeYaml(getNodes(), getEdges());
    if (!data) {
      return;
    }
    // downloadFile(`${data.fileName}.yml`, data.content, "yml");

    // console.log("3333", data.content);
    vscode.postMessage({
      type: "edit",
      content: data.content,
    });
    cachedYml = data.content;
  }, [getNodes, getEdges]);

  // const onUploadYML = useCallback(() => {
  //   const ele = document.getElementById("yml-upload");
  //   if (ele) {
  //     ele.click();
  //   }
  // }, []);

  // const uploadYML = useCallback(
  //   (event: React.ChangeEvent<HTMLInputElement>) => {
  //     if (!event.target.files) {
  //       return;
  //     }
  //     const file = event.target.files[0];
  //     let fileName = file.name.split(".").slice(0, -1).join(".");
  //     const reader = new FileReader();
  //     reader.onload = function () {
  //       const text = reader.result;
  //       updateFlowChart(fileName, text as string, translationSelection);
  //       cachedYml = text as string;
  //     };
  //     if (file) {
  //       reader.readAsText(file);
  //     }
  //     event.target.value = "";
  //   },
  //   [resetFlow]
  // );

  // /* Screenshot */

  // const onScreenshot = useCallback(() => {
  //   const nodesBounds = getRectOfNodes(getNodes());
  //   const targetScale = 1;
  //   const targetWidth = nodesBounds.width * targetScale;
  //   const targetHeight = nodesBounds.height * targetScale;

  //   const transform = getTransformForBounds(
  //     nodesBounds,
  //     targetWidth,
  //     targetHeight,
  //     0.5,
  //     2
  //   );
  //   const ele = document.querySelector(".react-flow__viewport");
  //   toJpeg(ele as HTMLElement, {
  //     backgroundColor: "#ffffff",
  //     quality: 0.95,
  //     width: targetWidth,
  //     height: targetHeight,
  //     style: {
  //       transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
  //     },
  //   }).then(downloadImage);
  // }, [getNodes]);

  /* Auto Layout */

  const onAutoLayout = useCallback(() => {
    const obj = autoLayout(getNodes(), getEdges());
    if (!obj) {
      return;
    }
    const objCopy = JSON.parse(JSON.stringify(obj));
    resetFlow(objCopy.nodes, objCopy.edges);
  }, [getNodes, getEdges, resetFlow]);

  const [needsLayout, setNeedsLayout] = useState(false);

  React.useEffect(() => {
    if (needsLayout) {
      onAutoLayout();
      setNeedsLayout(false);
    }
  }, [needsLayout, onAutoLayout]);

  /* VSCode yaml */

  React.useEffect(() => {
    // Notify vscode when webview startup completed.
    vscode.postMessage({
      type: "webview-lifecycle",
      content: "started",
    });

    let handlerFn = (event: MessageEvent<any>) => {
      handleVscodeMessage(event.data);
    };

    // Listen from extension message (document update, change translation etc)
    window.addEventListener("message", handlerFn);

    // Unregister listener when component unmounted
    return () => window.removeEventListener("message", handlerFn);
  }, []);

  function handleVscodeMessage(message: any) {
    switch (message.type) {
      case "update":
        // Update yaml
        let content = message.content as string;
        if (
          content.replace(/\r\n?/g, "\n") !== cachedYml.replace(/\r\n?/g, "\n")
        ) {
          // Avoid duplicated update
          console.log("update yml ...");
          // console.log("44444", cachedYml);

          updateFlowChart("fileName", content, translationSelection);
          cachedYml = content;

          break;
        }
        console.log("update yml ... nothing changed.");
        break;

      // Receive translationSelection setting
      case "betonquest-translationSelection":
        setTranslationSelection(message.content);
        updateFlowChart("fileName", cachedYml, message.content);

        break;
    }
  }

  let lastSelectedNodes: Node[] = [];

  useOnSelectionChange({
    onChange: ({ nodes, edges }) => {
      if (lastSelectedNodes === nodes) {
        return;
      }
      let nodeIDs: string[] = [];
      for (let i = 0; i < nodes.length; i++) {
        let n = nodes[i];
        nodeIDs = [...nodeIDs, n.id];
      }
      let eds = getEdges();
      for (let i = 0; i < eds.length; i++) {
        let e = eds[i];
        if (nodeIDs.includes(e.source) || nodeIDs.includes(e.target)) {
          e.selected = true;
          e.zIndex = 1;
          e.markerEnd = { type: MarkerType.ArrowClosed, color: "#ffb84e" };
          e.animated = true;
        } else {
          e.selected = false;
          e.zIndex = 0;
          e.markerEnd = { type: MarkerType.ArrowClosed };
          e.animated = false;
        }
      }
      setEdges(eds);
      console.log("changed selection", nodes, edges);
    },
  });

  // Check if the yaml multilingual status, for "Translation Selector".
  nodes.every(node => {
    switch (node["type"]) {
      case "npcNode":
      case "playerNode":
        isYamlMultilingual ||= Object.assign(new ConversationYamlOptionModel(), node.data["option"]).isTextMultilingual();
        break;
      default: // startNode
        isYamlMultilingual ||= Object.assign(new ConversationYamlModel(), node.data["yaml"]).isQuesterMultilingual();
        break;
    }
    if (isYamlMultilingual) {
      return false;
    }
    return true;
  });

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
          // snapToGrid={true}
          onNodeContextMenu={onNodeContextMenu}
          onPaneClick={onPaneClick}
        >
          {/* <MiniMap
            nodeColor={(n) => {
              switch (n.type) {
                case "startNode":
                  return "#dd9816";
                case "npcNode":
                  return "#00b3ff";
                case "playerNode":
                  return "#00c100";
              }
              return "#f00";
            }}
            className="minimap"
            zoomable
            pannable
          /> */}
          <Panel position="top-right" className="panel">
            <TranslationSelector enabled={isYamlMultilingual} selectedLanguage={translationSelection}></TranslationSelector>
            {/* <input
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
            </button> */}
          </Panel>

          <Background variant={BackgroundVariant.Dots} />
          {menu && <ContextMenu onClick={onPaneClick} {...menu} />}
        </ReactFlow>
      </div>
    </div>
  );
}

export default function flowView() {
  return (
    <ReactFlowProvider>
      <MyFlowView />
    </ReactFlowProvider>
  );
}
