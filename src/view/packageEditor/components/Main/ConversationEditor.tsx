import React, {
    useCallback,
    useEffect,
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
import { autoLayout, LayoutResult } from "./utils/autoLayout";

// TODO: refactor all option models with Conversation{}
import { ConversationYamlOptionModel, IConversationYamlOptionModel, TextMultilingualModel } from "./utils/conversationYamlModel";
import { conversationToFlow } from "./utils/conversationToFlow";
import { writeYaml } from "./utils/writeYaml";

import { vscode } from "../../vscode";
import { NodeData } from "./Nodes/Nodes";

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
    syncYaml: (delay?: number) => void,
}

// ========== TODO ==========
// 1. (DONE) replace "readYaml()", "writeYaml()"
// 2. (DONE) refacotr all option models with Conversation{}
// 3. prevent rerendering the whole flow map when the YAML is not updated (cache)
// 4. (DONE) refactor translation selection
// 5. fix new node creation
// 6. (DONE) delete node
// 7. (more...)
// ==========================

// eslint-disable-next-line @typescript-eslint/naming-convention
function ConversationFlowView(props: ConversationEditorProps) {
    // Cache translation selection
    // TODO: load translation from props?
    const [translationSelection, setTranslationSelection] = useState('');

    // Caching translation list
    const [allTranslations, setAllTranslations] = useState<string[]>([]);
    // Caching multilingual status
    const [isMultilingual, setIsMultilingual] = useState(false);
    useEffect(() => {
        const isMultilingual = props.conversation.isMultilingual();
        if (isMultilingual) {
            setIsMultilingual(isMultilingual);
            setAllTranslations(props.conversation.getTranslations());
        }
    }, [props.conversation]);

    const flowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState<any>([]); // TODO: replace any with a definite type
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
    } = useReactFlow<NodeData>();

    // Wraps for update nodes and edges
    const resetFlow = useCallback(
        // async (conversation: Conversation, syncYaml: (delay?: number | undefined) => void, translationSelection: string, viewport?: Viewport) => {
        //     let y = conversationToFlow(conversation, syncYaml, translationSelection);
        async (viewport?: Viewport) => {
            let flow = conversationToFlow(props.conversation, props.syncYaml, translationSelection);
            const formatedFlow = autoLayout(flow.nodes, flow.edges);
            if (formatedFlow) {
                flow.nodes = formatedFlow.nodes;
                flow.edges = formatedFlow.edges;
            }
            setNodes(flow.nodes);
            setEdges(flow.edges);
            if (viewport) {
                setViewport(viewport);
            }
            //  else {
            //     window.requestAnimationFrame(() => fitView());
            // }
        },
        [fitView, setEdges, setNodes, setViewport, props.conversation, props.syncYaml, translationSelection]
    );

    // Set initial states
    useEffect(() => {
        // set initial translation selection, it will also triger the initial rendering resetFlow() in belowing useEffect()
        setTranslationSelection(globalThis.initialConfig.translationSelection || 'en');
    }, []);

    // Update nodes and edges when props.conversation / translationSelection is udpated
    useEffect(() => {
        resetFlow();
    }, [props.conversation, translationSelection]);

    // Async/await lock, for VSCode message handling, etc
    const lock = new AsyncLock();

    // ID counter, for new nodes and edges
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
            if (fromNode.type === "startNode") {
                type = "npcNode";
            } else if (fromNode.type === "npcNode") {
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
                newNodeOption.text = {} as TextMultilingualModel;
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

    /* Handle nodes deletion */

    // Define the nodes / Edges deletion public method. Returns the nodes and edges actually deleted.
    const deleteNodes = useCallback((deletingNodes: Node<NodeData>[], updateFlowChart?: boolean): {deletedNodes: Node<NodeData>[], deletedEdges: Edge[]} => {
        // 1. filter out the nodes that needed to be deleted
        // 2. remove the nodes from the conversation
        // 3. remove the related edges (source / destination)
        // 4. if the node is a NPC option, reconnect "else" edges

        // Delete nodes
        // Filter the nodes that should be deleted
        const deletedNodes = deletingNodes.filter(item => item.type !== "startNode");
        // Filter out the new nodes to be updated
        const nodes2 = getNodes().filter(item => !deletedNodes.find(e => e.id === item.id));

        // Delete edges
        // Get the edges that need to be deleted
        const deletedEdges: Edge[] = getEdges().filter(item => deletedNodes.find(e => e.id === item.source || e.id === item.target));
        // Filter out the new nodes to be updated
        const edges2: Edge[] = getEdges().filter(item => !deletedEdges.find(e => e.id === item.id));
        
        // Delete nodes and reconnect edges
        deletedNodes.forEach(item => {
            // Delete the nodes and
            props.conversation.deleteOption(item.data.option?.getType() || "", item.data.option?.getName() || "");

            // Find the upper and lower stream edges
            const upperEdge = deletedEdges.find(e => e.target === item.id);
            const lowerEdge = deletedEdges.find(e => e.sourceHandle === "handleN" && e.source === item.id);

            // Delete source pointers from upstream options
            const upperNode: Node<NodeData> | undefined = upperEdge?.sourceNode;
            if (upperNode && item.data.option) {
                if (upperNode.type === "startNode") {
                    upperNode.data.conversation?.removeFirst([item.data.option.getName()]);
                } else {
                    upperNode.data.option?.removePointerNames([item.data.option.getName()]);
                }
            }

            // Reconnect edges for NPC's "else" nodes
            if (upperEdge && lowerEdge){
                edges2.push({
                    ...upperEdge,
                    target: lowerEdge.target,
                    targetHandle: lowerEdge.targetHandle,
                    targetNode: lowerEdge.targetNode,
                });
            }
        });

        // Update the flow chart if necessary
        if (updateFlowChart) {
            setNodes(nodes2);
        }
        setEdges(edges2);

        // Sync YAML to VSCode
        props.syncYaml();

        // Return the deleted nodes and edges
        return {
            deletedNodes: deletedNodes,
            deletedEdges: deletedEdges
        };
    }, [getNodes, getEdges, setNodes, setEdges, props.conversation, props.syncYaml]);

    // Deletion triggered with ReactFlow built-in events
    const onNodesDelete = useCallback((deletingNodes: Node<NodeData>[]) => {
        deleteNodes(deletingNodes);
    }, [nodes, edges]);

    // Deletion triggered with custom keyboard events
    const deleteButtonPressed = useKeyPress(["Delete"]);
    const deleteSelectedNodes = useCallback(() => {
        deleteNodes(getNodes().filter(item => item.selected), true);
    }, [getNodes, getEdges, setNodes, setEdges, props.conversation, props.syncYaml]);

    useEffect(() => {
        deleteSelectedNodes();
    }, [deleteButtonPressed]);

    /* VSCode messages */

    const handleVscodeMessage = (message: any) => {
        switch (message.type) {

            // Receive translationSelection setting
            case "betonquest-translationSelection":
                setTranslationSelection(message.content);

                break;

            // Center a node when cursor changed in Text Editor
            case "cursor-yaml-path":
                // TODO
        }
    };

    // Handle VSCode messages
    useEffect(() => {
        const handlerFn = (event: MessageEvent<any>) => {
            lock.acquire("message", () => { // Lock message handling to single "thread", prevent various race conditions
                handleVscodeMessage(event.data);
            });
        };

        // Listen from extension message (document update, change translation etc)
        window.addEventListener("message", handlerFn);

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
    // TODO: update to fit the new Package format
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
                    onNodesDelete={onNodesDelete}
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
                        <TranslationSelector enabled={isMultilingual} selectedTranslation={translationSelection} allTranslations={allTranslations}></TranslationSelector>
                    </Panel>

                    <Background variant={BackgroundVariant.Dots} />
                    {menu && <ContextMenu onClick={onPaneClick} deleteNodes={deleteNodes} {...menu} />}
                </ReactFlow>
            </div>
        </div>
    );
}

export default function conversationEditor(props: ConversationEditorProps) {
    console.log("prpos.conversation in conversation editor:", props.conversation);

    return (
        <>
            <div style={{width: "100%", position: "absolute", height: "6px", boxShadow: "var(--vscode-scrollbar-shadow) 0 6px 6px -6px inset"}}></div>
            <ReactFlowProvider>
                <ConversationFlowView {...props} />
            </ReactFlowProvider>
        </>
    );
}
