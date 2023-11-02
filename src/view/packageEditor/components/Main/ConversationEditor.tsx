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
    Panel,
    useViewport,
    updateEdge,
    OnSelectionChangeParams,
    HandleType
} from "reactflow";
import "reactflow/dist/style.css";
import "./ConversationEditor.css";

import AsyncLock from "async-lock";

import Conversation from "../../../../betonquest/Conversation";
import { NodeData } from "./Nodes/Nodes";
import NPCNode from "./Nodes/NPCNode";
import PlayerNode from "./Nodes/PlayerNode";
import StartNode from "./Nodes/StartNode";
import ConnectionLine from "./Nodes/ConnectionLine";
import ContextMenu from "./Nodes/ContextMenu";
import TranslationSelector from "./components/TranslationSelector";

import { autoLayout } from "./utils/autoLayout";
import { conversationToFlow } from "./utils/conversationToFlow";
import { vscode } from "../../vscode";
import {
    addPointersToUpstream,
    getConflictEdges,
    getDownstreamNpcNodes,
    getUpstreamNodes,
    isConnectionLooped,
} from "./utils/commonUtils";

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
// 3. (DONE) prevent rerendering the whole flow map when the YAML is not updated (cache)
// 4. (DONE) refactor translation selection
// 5. (DONE) fix new node creation UI
// 6. (DONE) delete node
// 7. (DONE) edges delete
// 8. (DONE) edges connect
// 9. (DONE) edges re-connect
// 9. (DONE) sync yaml when creating new node
// 10. (DONE) cursor position
// 11. (more...)
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
    const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const viewport = useViewport();
    const {
        getNode,
        getNodes,
        getEdges,
        project,
        setViewport,
        fitView,
    } = useReactFlow<NodeData>();

    // Cache stuff that need to be referenced in useEffect() ...
    // Cache viewport
    const viewportRef = React.useRef(viewport);
    const setViewportRef = React.useRef(setViewport);
    React.useEffect(() => {
        viewportRef.current = viewport;
        setViewportRef.current = setViewport;
    }, [viewport, setViewport]);

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
                setViewportRef.current(viewport);
            }
            //  else {
            //     window.requestAnimationFrame(() => fitView());
            // }
        },
        [fitView, setEdges, setNodes, props.conversation, props.syncYaml, translationSelection]
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
    const lineID = useRef(1);
    const getNewLineID = useCallback((edges?: Edge[]) => {
        if (!edges) {
            edges = getEdges();
        }
        while (edges.some(e => e.id === `line_${lineID.current}`)) {
            lineID.current++;
        }
        return `line_${lineID.current}`;
    }, [getEdges]);

    const nodeID = useRef(1);
    const getNewNodeID = useCallback((nodes?: Node[]) => {
        if (!nodes) {
            nodes = getNodes();
        }
        while (nodes.some(n => n.id === `npcNode_node_${nodeID.current}` || n.id === `playerNode_node_${nodeID.current}`)) {
            nodeID.current++;
        }
        return `node_${nodeID.current}`;
    }, [getNodes]);

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

    // Handle Edge change

    const isEdgeChanging = useRef<boolean>(false);

    const onEdgeUpdateStart = (event: React.MouseEvent<Element, MouseEvent>, edge: Edge<any>, handleType: HandleType) => {
        // mark "update" status, prevent new node creation
        isEdgeChanging.current = true;
    };

    // Handle Edge connection changed from one node to another
    // For "new Edge connection created" event, check out Start/NPC/PlayerNode.tsx > onConnect()
    const onEdgeUpdateEnd = (event: MouseEvent | TouchEvent, edge: Edge<any>, handleType: HandleType) => {
        // reset "update" status
        isEdgeChanging.current = false;
    };

    // Handle Edge update (change connection)
    const onEdgeUpdate = useCallback((oldEdge: Edge, newConnection: Connection) => {
        // Update conversation pointers

        // Prevent same edge update
        if (oldEdge.source === newConnection.source && oldEdge.target === newConnection.target) {
            return;
        }

        // Get source and target nodes
        const sourceNode = getNode(newConnection.source!);
        const targetNode = getNode(newConnection.target!);
        if (!sourceNode || !targetNode) {
            return;
        }

        // Prevent looped connection
        if (isConnectionLooped(sourceNode, targetNode, edges)) {
            return;
        }

        // Remove old pointers from YAML
        onEdgesDelete([oldEdge]);

        // Prevent duplicated edge update
        let edges2 = edges.filter(edge => edge.source !== newConnection.source || edge.target !== newConnection.target || edge.sourceHandle !== newConnection.sourceHandle);
        if (edges.length !== edges2.length) {
            setEdges(edges.filter(edge => edge.id !== oldEdge.id)); // UI
            props.syncYaml(); // YAML
            return;
        }

        // Prevent conflict edges
        const conflictEdges = getConflictEdges(sourceNode, newConnection.sourceHandle!, edges)
            .filter(edge => edge.id !== oldEdge.id); // "self" should not be considered as conflict
        if (conflictEdges.length  > 0){
            onEdgesDelete(conflictEdges, edges2); // update YAML
            edges2 = edges2.filter(edge => !conflictEdges.some(e => edge.id === e.id)); // Remove from UI
        }

        // Set downstream popinters on the new source option
        const downstreamNodes = getDownstreamNpcNodes(targetNode, edges2);
        addPointersToUpstream(sourceNode, targetNode, downstreamNodes.map(node => node.data.option?.getName()!), edges2);

        // Update UI
        // Update target node
        oldEdge.sourceNode = sourceNode;
        oldEdge.targetNode = targetNode;
        // Update edges list
        setEdges(updateEdge(oldEdge, newConnection, edges2));

        // update yaml
        props.syncYaml();
    } , [edges, getNode, setEdges, props.syncYaml]);

    // Cache deleting edges
    const deletingEdges = useRef<Edge[]>([]);

    // Handle Edge deletion
    // Mainly delete related pointers from the Conversation
    const onEdgesDelete = useCallback((deletedEdges: Edge[], searchEdges: Edge[] = edges) => {
        // Cache deleted edges, for used in onNodesDelete(), prevent deleted edges being rolled-back
        deletingEdges.current = deletedEdges;

        // Remove old pointers
        // Note: if target is NPC, remove till end (deal with "else")
        deletedEdges.forEach(deletedEdge => {
            // 1. get the source option from conversation{}
            // 2. delete the pointers from the source option
            // note that source option could be "first"

            const targetOption = (deletedEdge.targetNode?.data as NodeData).option;
            if (targetOption) {
                // // Get the source option
                // const oldSourceOption = props.conversation.getNpcOption(oldTargetPointer);
                switch (deletedEdge.sourceNode?.type) {
                    case "startNode":
                        props.conversation.removeFirstTillEnd(targetOption.getName());
                        break;
                    case "playerNode":
                        (deletedEdge.sourceNode.data as NodeData).option?.removePointerNamesTillEnd(targetOption.getName());
                        break;
                    case "npcNode":
                        // It could be npc->player, or npc->npc
                        if (deletedEdge.sourceHandle === "handleN") {
                            // npc->npc
                            // Iterate and find source player / start options, then delete pointers from it
                            getUpstreamNodes(deletedEdge.sourceNode as Node<NodeData>, searchEdges!).map(node => {
                                switch (node.type) {
                                    case "npcNode":
                                    case "playerNode":
                                      node.data.option?.removePointerNamesTillEnd(targetOption.getName());
                                      break;
                                    case "startNode":
                                      node.data.conversation?.removeFirstTillEnd(targetOption.getName());
                                      break;
                                }
                            });
                        } else {
                            // npc->player
                            (deletedEdge.sourceNode.data as NodeData).option?.removePointerNames([targetOption.getName()]);
                        }
                        break;
                }
            }
        });

        // update yaml
        props.syncYaml();
    } , [edges, props.conversation, props.syncYaml]);

    // Auto create new node and edge

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

    // Drag-and-drop node creation
    const onConnectEnd = useCallback((event: MouseEvent | TouchEvent) => {
        event.preventDefault();
        if (!event) {
            return;
        }
        if (event instanceof TouchEvent) {
            return;
        }
        const wrapper = flowWrapper.current;
        if (!wrapper) {
            return;
        }
        const { top, left } = wrapper.getBoundingClientRect();

        // Prevent creating new node when edge is not landed on the empty pane
        const targetIsPane = (event.target as any).classList.contains(
            "react-flow__pane"
        );
        if (!targetIsPane) {
            return;
        }
        // Prevent creating new node when edge start from an "in" handle
        if (connectingParams.current.handleId === "handleIn") {
            return;
        }
        // Prevent creating new node if it is activated by Edge change
        if (isEdgeChanging.current) {
            return;
        }

        const hitPosition = project({
            x: event.clientX - left,
            y: event.clientY - top,
        });

        // Prevent creating new node when end position landed near an existing node
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

        // Get source Node
        const sourceNode = getNode(connectingParams.current.nodeId || "");
        if (!sourceNode) {
            return;
        }
        let type = "npcNode";
        if (sourceNode.type === "startNode") {
            type = "npcNode";
        } else if (sourceNode.type === "npcNode") {
            if (connectingParams.current.handleId === "handleOut") {
                type = "playerNode";
            } else {
                type = "npcNode";
            }
        } else {
            type = "npcNode";
        }

        // Create Node
        const newNodeName = getNewNodeID();
        const newNodeID = type + "_" + newNodeName;
        const data: NodeData = {
            conversation: props.conversation,
            syncYaml: props.syncYaml,
            translationSelection: translationSelection,
        };
        if (type === "npcNode") {
            data.option = props.conversation.createNpcOption(newNodeName);
        } else {
            data.option = props.conversation.createPlayerOption(newNodeName);
        }
        const newNode: Node<NodeData> = {
            id: newNodeID,
            type: type,
            position: { x: hitPosition.x - 100, y: hitPosition.y },
            data: data,
        };

        setNodes((nds) => nds.concat(newNode));

        // Create Edge
        const newLineID = getNewLineID();
        let edge: Edge = {
            id: newLineID,
            type: "smoothstep",
            markerEnd: { type: MarkerType.ArrowClosed },
            source: sourceNode.id,
            sourceHandle: connectingParams.current.handleId,
            sourceNode: sourceNode,
            target: newNodeID,
            targetHandle: "handleIn",
            targetNode: newNode,
        };

        // Remove conflict edges
        const deletingEdges = getConflictEdges(
            sourceNode,
            connectingParams.current.handleId || "",
            edges
        );
        onEdgesDelete(deletingEdges); // update YAML
        setEdges(addEdge(edge, edges.filter(edge => !deletingEdges.some(e => edge.id === e.id)))); // update UI

        // Set upstream pointers
        addPointersToUpstream(sourceNode, newNode, [newNodeName], edges);

        // Sync YAML to VSCode
        props.syncYaml();
    }, [project, getNode, getNewNodeID, setNodes, getNewLineID, edges, setEdges, nodes, props.syncYaml]);

    // Handle new Edge connected
    const onConnect = useCallback((params: Connection) => {
        if (!params) {
            return;
        }
        const sourceID = params.source || "";
        const targetID = params.target || "";
        const sourceNode = getNode(sourceID);
        const targetNode = getNode(targetID);
        if (!sourceNode || !targetNode) {
            return;
        }

        // Prevent looped connection
        if (isConnectionLooped(sourceNode, targetNode, edges)) {
            return;
        }

        // Remove conflict edges
        const conflictEdges = getConflictEdges(
            sourceNode,
            params.sourceHandle || "",
            edges
        );
        onEdgesDelete(conflictEdges); // update YAML

        // Add downstream pointers to the source node
        const downstreamNodes = getDownstreamNpcNodes(targetNode, edges);
        addPointersToUpstream(sourceNode, targetNode, downstreamNodes.map(node => node.data.option?.getName()!), edges);

        // UI
        let edge: Edge = {
            id: getNewLineID(),
            type: "smoothstep",
            markerEnd: { type: MarkerType.ArrowClosed },
            source: sourceNode.id,
            sourceHandle: params.sourceHandle || "",
            sourceNode: sourceNode,
            target: targetID,
            targetHandle: params.targetHandle || "",
            targetNode: getNode(targetID),
        };
        setEdges(addEdge(edge, edges.filter(edge => conflictEdges.every(e => edge.id !== e.id)))); // update UI

    }, [edges, getNewLineID, getNode, setEdges]);

    /* Handle nodes deletion */

    // Define the nodes / Edges deletion public method. Returns the nodes and edges actually deleted.
    const onNodesDelete = useCallback((deletingNodes: Node<NodeData>[], updateFlowChart: boolean = false): {finalNodes: Node<NodeData>[], finalEdges: Edge[], deletedNodes: Node<NodeData>[], deletedEdges: Edge[]} => {
        // 1. filter out the nodes that needed to be deleted
        // 2. remove the nodes and pointers from the conversation
        // 3. remove the related edges (source / destination)
        // 4. if the node is a NPC option, reconnect "else" edges

        // Get deleted nodes
        // Get all nodes that are going to be updated
        let nodes2 = getNodes();
        // Filter the nodes that should be deleted
        const deletedNodes = deletingNodes.filter(item => item.type !== "startNode");

        // Get related edges
        // Get all edges that is goting to be lookuped
        let searchEdges: Edge[] = getEdges();
        // Get all edges that need to be updated
        let edges2: Edge[] = searchEdges.filter(edge => deletingEdges.current.every(e => edge.id !== e.id)); // prevent deleted edges being rolled-back
        deletingEdges.current = [];
        // Cache the edges that are going to be deleted
        const deletedEdges: Edge[] = [];

        // Usually ReactFlow has already called onEdgesDelete() for us if deletion is triggered by default keys (e.g. backspace)
        // But if related edges' pointers are still not be removed yet, delete them
        onEdgesDelete(searchEdges.filter(e => deletedNodes.some(n => e.source === n.id || e.target === n.id)), edges2);
        
        // Delete nodes and reconnect edges
        deletedNodes.forEach(item => {
            // Delete the nodes and
            props.conversation.deleteOption(item.data.option?.getType() || "", item.data.option?.getName() || "");

            // Find the upper and lower stream edges
            const upperEdges = searchEdges.filter(e => e.target === item.id); // it might have multiple connections going to a npc node
            const lowerEdge = searchEdges.find(e => e.sourceHandle === "handleN" && e.source === item.id);

            upperEdges.forEach(upperEdge => {
                const upperSourceNode: Node<NodeData> | undefined = upperEdge?.sourceNode;

                // Reconnect edges for NPC's "else" nodes
                if (upperEdge && lowerEdge){
                    // YAML
                    // Iterate all downstream "else" nodes and find pointers that need to be set
                    const elseNodes = getDownstreamNpcNodes(lowerEdge.targetNode!, searchEdges);
                    // Get all pointers and set it on source
                    const allPointers: string[] = elseNodes.map(n => n.data.option?.getName()!);
                    if (upperSourceNode) {
                        addPointersToUpstream(upperSourceNode, lowerEdge.targetNode!, allPointers, searchEdges);
                    }

                    // UI
                    // Append the new edge to list
                    edges2.push({
                        ...upperEdge,
                        id: getNewLineID(edges2),
                        target: lowerEdge.target,
                        targetHandle: lowerEdge.targetHandle,
                        targetNode: lowerEdge.targetNode,
                        selected: false // prevent edge being deleted due to "Delete" key press
                    });
                }
            });

            // Remove the node from list
            nodes2 = nodes2.filter(n => n.id !== item.id);

            // Remove the edges from search list
            searchEdges = searchEdges.filter(e => e.source !== item.id && e.target !== item.id);
            // Remove the edges from final edges
            deletedEdges.push(...edges2.filter(e => e.source === item.id || e.target === item.id)); // cache deleted edges
            edges2 = edges2.filter(e => e.source !== item.id && e.target !== item.id);
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
            finalNodes: nodes2,
            finalEdges: edges2,
            deletedNodes: deletedNodes,
            deletedEdges: deletedEdges
        };
    }, [getNodes, getEdges, setNodes, setEdges, props.conversation, props.syncYaml]);


    /* Handle node selection due to VSCode cursor */
    
    // Center and select a node by YAML path
    const centerAndSelectNode = useCallback((yamlPath: string[]) => {
        // Skip if path not landed in "NPC_options" or "player_options"
        if (yamlPath.length < 2 || yamlPath[0] !== "conversations" || yamlPath[1] !== props.conversationName) {
            return;
        }
        // Center a node by type
        let type = "";
        switch (yamlPath[2]) {
            case "NPC_options":
                type = "npcNode";
                break;
            case "player_options":
                type = "playerNode";
                break;
        }
        if (type === "") {
            return;
        }

        // Select and center the node
        const ndoes2 = getNodes().map(node => {
            if (node.type === type && node.data.option?.getName() === yamlPath[3]) {
                node.selected = true;
                // Move the Viewport
                let x = 0;
                let y = 0;
                x = (-node.position.x - (node.width || 0) / 2) * viewportRef.current.zoom + (flowWrapper.current?.getBoundingClientRect().width || 0) / 2;
                y = (-node.position.y - (node.height || 0) / 2) * viewportRef.current.zoom + (flowWrapper.current?.getBoundingClientRect().height || 0) / 2;
                setViewportRef.current({ x: x, y: y, zoom: viewportRef.current.zoom }, { duration: 250 });
            } else {
                node.selected = false;
            }
            return node;
        });
        setNodes(ndoes2);

        // de-select all edges
        setEdges(getEdges().map(edge => {edge.selected = false;return edge;}));
    }, [props.conversationName, getNodes]);

    /* VSCode messages */

    const handleVscodeMessage = (message: any) => {
        switch (message.type) {

            // Receive translationSelection setting
            case "betonquest-translationSelection":
                setTranslationSelection(message.content);

                break;

            // Center a node when cursor changed in Text Editor
            case "cursor-yaml-path":
                centerAndSelectNode(message.content as string[]);
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

    const onSelectionChange = useCallback((changed: OnSelectionChangeParams) => {
        const edges = getEdges();

        const edgeIDs: string[] = [];
        changed.edges.forEach(e => {
            edgeIDs.push(e.id);
        });
        const nodeIDs: string[] = [];
        changed.nodes.forEach(n => {
            nodeIDs.push(n.id);
        });

        edges.map(edge => {
            if (nodeIDs.includes(edge.source) || nodeIDs.includes(edge.target)) {
                // Highlight all related edges
                edge.selected = true;
                edge.zIndex = 1;
                edge.style = { stroke: "#ffb84e", strokeWidth: 4 };
                edge.markerEnd = { type: MarkerType.ArrowClosed, color: "#ffb84e" };
                edge.animated = true;
            } else if (edgeIDs.includes(edge.id)) {
                // Change selected edges' color
                edge.selected = true;
                edge.zIndex = 1;
                edge.style = { stroke: "#ffb84e", strokeWidth: 4 };
                edge.markerEnd = { type: MarkerType.ArrowClosed, color: "#ffb84e" };
                edge.animated = false;
            } else {
                edge.selected = false;
                edge.zIndex = 0;
                edge.style = undefined;
                edge.markerEnd = { type: MarkerType.ArrowClosed };
                edge.animated = false;
            }
        });
        setEdges(edges);
    }, [getEdges, setEdges]);

    // Move the cursor when a node is selected
    const onNodeClick = useCallback((event: ReactMouseEvent, node: Node<NodeData>) => {
        let content: string[];
        switch (node.type) {
            case "startNode":
                content = ["conversations", props.conversationName, "quester"];
                break;
            case "npcNode":
                content = ["conversations", props.conversationName, "NPC_options", node.data.option?.getName()!];
                break;
            case "playerNode":
                content = ["conversations", props.conversationName, "player_options", node.data.option?.getName()!];
                break;
            default:
                return;
        }
        vscode.postMessage({
            type: "cursor-yaml-path",
            content: content,
        });
    }, [props.conversationName]);

    return (
        <div className="flow-container">
            <div className="flow-wrapper" ref={flowWrapper}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodesDelete={onNodesDelete}
                    onEdgesDelete={onEdgesDelete}
                    deleteKeyCode={["Delete", "Backspace"]}
                    onEdgeUpdate={onEdgeUpdate}
                    onEdgeUpdateStart={onEdgeUpdateStart}
                    onEdgeUpdateEnd={onEdgeUpdateEnd}
                    onConnectStart={onConnectStart}
                    onConnectEnd={onConnectEnd}
                    onConnect={onConnect}
                    onSelectionChange={onSelectionChange}
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
                    {menu && <ContextMenu onClick={onPaneClick} deleteNodes={onNodesDelete} {...menu} />}
                </ReactFlow>
            </div>
        </div>
    );
}

export default function conversationEditor(props: ConversationEditorProps) {
    return (
        <>
            <div style={{width: "100%", position: "absolute", height: "6px", boxShadow: "var(--vscode-scrollbar-shadow) 0 6px 6px -6px inset"}}></div>
            <ReactFlowProvider>
                <ConversationFlowView {...props} />
            </ReactFlowProvider>
        </>
    );
}
