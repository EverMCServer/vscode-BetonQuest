import React, {
    useCallback,
    useRef,
    useState,
    MouseEvent as ReactMouseEvent,
    TouchEvent as ReactTouchEvent,
} from "react";
import ReactFlow, {
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
    Panel,
    useViewport,
    useOnSelectionChange
} from "reactflow";
import "reactflow/dist/style.css";
import "./ConversationEditor.css";

import AsyncLock from "async-lock";

import Conversation from "../../../../betonquest/Conversation";

import {
    initialNode,
    removeLinesOnConnect,
} from "./utils/commonUtils";

import NPCNode from "./Nodes/NPCNode";
import PlayerNode from "./Nodes/PlayerNode";
import StartNode from "./Nodes/StartNode";
import ConnectionLine from "./Nodes/ConnectionLine";
import ContextMenu from "./Nodes/ContextMenu";
import TranslationSelector from "./components/TranslationSelector";
import { autoLayout } from "./utils/autoLayout";

// TODO: refactor all option models with Conversation{}
import { ConversationYamlOptionModel, IConversationYamlOptionModel, TextMultilingualModel } from "./utils/conversationYamlModel";
import { readYaml } from "./utils/readYaml";
import { writeYaml } from "./utils/writeYaml";

import { vscode } from "../../vscode";

// Define the node's React.JSX.Element
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

interface ConversationEditorProps {
    conversation: Conversation,
    conversationName: string,
    syncYaml: Function,
}

// ========== TODO ==========
// 1. replace "readYaml()", "writeYaml()"
// 2. refacotr all option models with Conversation{}
// 3. prevent rerender the whole flow map only when the YAML is not updated (cache)
// 4. (more...)
// ==========================

// eslint-disable-next-line @typescript-eslint/naming-convention
function MyFlowView(props: ConversationEditorProps) {
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
    } = useReactFlow<any>(); // TODO: replace any with a definite type

    // Cache translation selection
    const [translationSelection, setTranslationSelection] = useState(globalThis.initialConfig.translationSelection);

    // Caching translation list
    // let allTranslations: string[] = [];
    const [allTranslations, setAllTranslations] = useState(["en"]);

    // Async/await lock, for message handling, etc
    const lock = new AsyncLock();

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
        while (getNode(`npcNode_node_${nodeID}`) || getNode(`playerNode_node_${nodeID}`)) {
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

            // Calculate the position of the node
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
            if (fromNode.data["translationSelection"] && fromNode.data["translationSelection"].length > 0) {
                isMultilingual = true;
            }
            const newNodeOption: IConversationYamlOptionModel = {};
            if (isMultilingual) {
                newNodeOption.text = { [fromNode.data["translationSelection"]]: "" } as TextMultilingualModel;
            } else {
                newNodeOption.text = "";
            }
            console.log("new node is multilingual:", Object.assign(new ConversationYamlOptionModel(), newNodeOption).isTextMultilingual());

            const newNodeName = getNewNodeID();
            const newNodeID = type + "_" + newNodeName;
            const newNode = {
                id: newNodeID,
                type,
                position: { x: hitPosition.x - 100, y: hitPosition.y },
                data: { name: `${newNodeName}`, option: newNodeOption, translationSelection: fromNode.data["translationSelection"] },
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
            // setEdges([]);
            // setNodes([]);
            // setViewport({ x: 0, y: 0, zoom: 1 });

            // setTimeout(() => {
            setNodes(nodes || []);
            setEdges(edges || []);
            // if (viewport) {
            //     setViewport(viewport);
            // } else {
            //     window.requestAnimationFrame(() => fitView());
            // }
            // }, 0);
        },
        [fitView, setEdges, setNodes, setViewport]
    );

    // Public method to update flowchart contents
    let updateFlowChart = (translationSelection?: string) => {
        const flow = readYaml(props.conversation.getYamlText(), translationSelection || "en");
        if (!flow) {
            return;
        }

        const obj = autoLayout(flow.nodes, flow.edges);
        if (!obj) {
            return;
        }

        // Preserve nodes selection if possible
        // Find selected nodes
        let noedIDs: string[] = [];
        nodesRef.current.map((node) => {
            if (node.selected) {
                noedIDs.unshift(node.id);
            }
        });
        // Set nodes selection
        obj.nodes.map((node) => {
            if (noedIDs.includes(node.id)) {
                node.selected = true;
            }
        });

        let langs: string[] = [];
        obj.nodes.forEach((n, i) => {
            // Add update callback on nodes
            obj.nodes[i].data.updateYaml = updateYaml;
            // Get all translations from yaml
            switch (n.type) {
                case "startNode":
                    if (n.data.yaml.quester) {
                        for (const [k, _] of Object.entries(n.data.yaml.quester)) {
                            if (!langs.find(v => v === k)) {
                                langs.push(k);
                            }
                        }
                    }
                    break;
                case "npcNode":
                case "playerNode":
                    if (n.data.option.text) {
                        for (const [k, _] of Object.entries(n.data.option.text)) {
                            if (!langs.find(v => v === k)) {
                                langs.push(k);
                            }
                        }
                    }
                    break;
            }
        });
        setAllTranslations(langs);

        // const objCopy = JSON.parse(JSON.stringify(obj));
        // resetFlow(objCopy.nodes, objCopy.edges);
        resetFlow(obj.nodes, obj.edges);
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
            timeoutHandler = window.setTimeout(() => {
                // Update
                updateYaml();
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

    const updateYaml = useCallback(() => {
        const data = writeYaml(getNodes(), getEdges()); // TODO
        if (!data) {
            return;
        }

        props.syncYaml();
    }, [getNodes, getEdges]);

    //
    // Cache stuff that need to be referenced in useEffect() ...
    // Cache "nodes"
    const nodesRef = React.useRef(nodes);
    // Cache setViewport()
    const setViewportRef = React.useRef(setViewport);
    const viewportRef = React.useRef(viewport);
    // Cache translation selection
    const translationSelectionRef = React.useRef(translationSelection);
    React.useEffect(() => {
        nodesRef.current = nodes;
        setViewportRef.current = setViewport;
        viewportRef.current = viewport;
        translationSelectionRef.current = translationSelection;
    }, [nodes, setViewport, viewport, translationSelection]);

    /* Initialize flowchart */
    React.useEffect(() => {
        updateFlowChart(translationSelectionRef.current);
    }, [props.conversation]);

    /* VSCode messages */

    const handleVscodeMessage = (message: any) => {
        switch (message.type) {
            //   case "update":
            //     // Update yaml
            //     let content = message.content as string;
            //     if (
            //       content.replace(/\r\n?/g, "\n") !== cachedYml.replace(/\r\n?/g, "\n")
            //     ) {
            //       // Avoid duplicated update
            //       console.log("update yml ...");
            //       // console.log("44444", cachedYml);

            //       updateFlowChart(translationSelectionRef.current);
            //       cachedYml = content;

            //       break;
            //     }
            //     console.log("update yml ... nothing changed.");
            //     break;

            // Receive translationSelection setting
            case "betonquest-translationSelection":
                setTranslationSelection(message.content);
                updateFlowChart(message.content);

                break;

            // Center a node when cursor changed in Text Editor
            case "cursor-yaml-path":
                const pa = message.content as string[];
                // Skip if path not landed in "NPC_options" or "player_options"
                if (pa.length < 2) {
                    break;
                }
                // Center a node by type
                let type = "";
                switch (pa[0]) {
                    case "NPC_options":
                        type = "npcNode";
                        break;
                    case "player_options":
                        type = "playerNode";
                        break;
                }
                if (type === "") {
                    break;
                }
                nodesRef.current.map(node => {
                    if (node.data.name === pa[1] && node.type === type) {
                        let x = 0;
                        let y = 0;
                        node.selected = true;
                        x = (-node.position.x - (node.width || 0) / 2) * viewportRef.current.zoom + (flowWrapper.current?.getBoundingClientRect().width || 0) / 2;
                        y = (-node.position.y - (node.height || 0) / 2) * viewportRef.current.zoom + (flowWrapper.current?.getBoundingClientRect().height || 0) / 2;
                        // Move the Viewport
                        setViewportRef.current({ x: x, y: y, zoom: viewportRef.current.zoom }, { duration: 250 });
                    } else {
                        node.selected = false;
                    }
                    return node;
                });
                // Update node selections
                setNodes([...nodesRef.current]);
                // console.log("node selection updated");
                break;
        }
    };

    // Handle VSCode messages
    React.useEffect(() => {
        const handlerFn = (event: MessageEvent<any>) => {
            lock.acquire("message", () => { // Lock message handling to single thread, prevent various race conditions
                // console.log("new message:", event.data.type);
                handleVscodeMessage(event.data);
            });
        };

        // Listen from extension message (document update, change translation etc)
        window.addEventListener("message", handlerFn);

        // // Notify vscode when webview startup completed.
        // vscode.postMessage({
        //   type: "webview-lifecycle",
        //   content: "started",
        // });

        // Unregister listener when component unmounted
        return () => window.removeEventListener("message", handlerFn);
    }, []);

    let lastSelectedNodes: Node[] = [];

    useOnSelectionChange({
        onChange: ({ nodes, edges }) => {
            if (lastSelectedNodes === nodes) {
                return;
            }
            // Highlight all related edges
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
        },
    });

    // Move the cursor when a node is selected
    const onNodeClick = (event: ReactMouseEvent, node: Node) => {
        let content: string[];
        switch (node.type) {
            case "startNode":
                content = ["quester"];
                break;
            case "npcNode":
                content = ["NPC_options", node.data.name];
                break;
            case "playerNode":
                content = ["player_options", node.data.name];
                break;
            default:
                return;
        }
        vscode.postMessage({
            type: "cursor-yaml-path",
            content: content,
        });
    };

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
                    fitViewOptions={{ minZoom: 0.1, maxZoom: 1.0 }}
                    minZoom={0.1}
                    maxZoom={1.5}
                    // snapToGrid={true}
                    onNodeContextMenu={onNodeContextMenu}
                    onPaneClick={onPaneClick}
                    onNodeClick={onNodeClick}
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
                        <TranslationSelector enabled={props.conversation.isMultilingual()} selectedTranslation={translationSelection} allTranslations={allTranslations}></TranslationSelector>
                    </Panel>

                    <Background variant={BackgroundVariant.Dots} />
                    {menu && <ContextMenu onClick={onPaneClick} {...menu} />}
                </ReactFlow>
            </div>
        </div>
    );
}

export default function conversationEditor(props: ConversationEditorProps) {
    console.log("prpos.conversation in conversation editor:", props.conversation);

    return (
        <>
        {/* <div style={{height: "100%",lineHeight: 0}}> */} {/* remove the default lineHeight from antd Tabs */}
            <div style={{width: "100%", position: "absolute", height: "6px", boxShadow: "var(--vscode-scrollbar-shadow) 0 6px 6px -6px inset"}}></div>
            <ReactFlowProvider>
                <MyFlowView {...props} />
            </ReactFlowProvider>
        {/* </div> */}
        </>
    );
}