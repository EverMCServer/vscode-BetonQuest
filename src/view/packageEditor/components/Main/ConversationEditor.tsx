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
    updateEdge,
    OnSelectionChangeParams,
    HandleType
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
// 3. (DONE) prevent rerendering the whole flow map when the YAML is not updated (cache)
// 4. (DONE) refactor translation selection
// 5. (DONE) fix new node creation UI
// 6. (DONE) delete node
// 7. (DONE) edges delete
// 8. edges connect
// 9. edges re-connect
// 9. sync yaml when creating new node
// 10. (more...)
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
        // console.log("onEdgeUpdateStart:", event, edge, handleType);
        console.log("onEdgeUpdateStart:", edge.source);
        // mark "update" status, prevent new node creation
        isEdgeChanging.current = true;
    };

    // Handle Edge connection changed from one node to another
    // For "new Edge connection created" event, check out Start/NPC/PlayerNode.tsx > onConnect()
    const onEdgeUpdateEnd = (event: MouseEvent | TouchEvent, edge: Edge<any>, handleType: HandleType) => {
        // event.preventDefault();
        // calculate and update pointers
        // console.log("onEdgeUpdateEnd:", event, edge, handleType);
        console.log("onEdgeUpdateEnd:", edge.source);

        // reset "update" status
        isEdgeChanging.current = false;
    };

    // Handle Edge update (change connection)
    const onEdgeUpdate = useCallback((oldEdge: Edge, newConnection: Connection) => {
        // Update conversation pointers
        // ...
        console.log("onEdgeUpdate:", oldEdge, newConnection);

        // Skip same node update
        // TODO...

        // Get target name
        const newTargetName = newConnection.target?.split("_", 2)[1];
        if (!newTargetName) {
            return;
        }

        // Remove old pointers
        // Note: if target is NPC, remove till end (deal with "else")
        const oldTargetPointer = (oldEdge.targetNode?.data as NodeData).option?.getName();
        if (oldTargetPointer) {
            switch (oldEdge.sourceNode?.type) {
                case "startNode":
                    (oldEdge.sourceNode?.data as NodeData).conversation?.removeFirstTillEnd(oldTargetPointer);
                    break;
                case "playerNode":
                    (oldEdge.sourceNode?.data as NodeData).option?.removePointerNamesTillEnd(oldTargetPointer);
                    break;
                case "npcNode":
                    (oldEdge.sourceNode?.data as NodeData).option?.removePointerNames([oldTargetPointer]);
                    break;
            }
        }

        // Set new popinters on the new source option
        switch (oldEdge.targetNode?.type) {
            case "playerNode":
                // Just simply appenend the pointer onto the new node
                
                break;
            case "npcNode":
                break;
        }
        
        // Update connection
        setEdges((els) => updateEdge(oldEdge, newConnection, els));

        // update yaml
        props.syncYaml();
    } , [setEdges, props.syncYaml]);

    // Cache deleting edges
    const deletingEdges = useRef<Edge[]>([]);

    // Handle Edge deletion
    // Mainly delete related pointers from the Conversation
    const onEdgesDelete = useCallback((deletedEdges: Edge[]) => {
        console.log("onEdgesDelete:", deletedEdges);

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
                            // Search all source player options, and remove the pointers
                            props.conversation.getAllPlayerOptions().filter(o => o.getPointerNames().includes(targetOption.getName()))
                                .forEach(o => {o.removePointerNamesTillEnd(targetOption.getName());});
                            // Make sure it is not in the "first" as well
                            props.conversation.removeFirstTillEnd(targetOption.getName());
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
    } , [props.conversation, props.syncYaml]);

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
            source: connectingParams.current.nodeId || "",
            sourceHandle: connectingParams.current.handleId,
            sourceNode: fromNode,
            target: newNodeID,
            targetHandle: "handleIn",
            targetNode: newNode,
        };

        // Remove conflict edges
        // TODO: remove pointers as well
        const newEdges = removeLinesOnConnect(
            fromNode,
            edges,
            connectingParams.current.nodeId || "",
            connectingParams.current.handleId || ""
        );

        setEdges(addEdge(edge, newEdges));

        // Set upstream pointers
        // TODO ...
        // 1. Set pointers on upstream options / "first"
        // 2. Lookup upstream nodes, if upperstream is npc->npc
        switch (fromNode.type) {
            case "startNode":
                fromNode.data.conversation?.insertFirst([newNodeName]);
                break;
            case "playerNode":
                fromNode.data.option?.insertPointerNames([newNodeName]);
                break;
            case "npcNode":
                switch (newNode.type) {
                    case "playerNode":
                        fromNode.data.option?.insertPointerNames([newNodeName]);
                        break;
                    case "npcNode":
                    // npc->npc
                    // Search all source options / first, and set the pointers on them
                    // Steps:
                    // 1. Search the first NPC node
                    // 2. Search all nodes point to this NPC node
                    // 3. Set new pointers on the node

                    // Iterate and find the first NPC node
                    let currentNode: Node<NodeData> = fromNode;
                    do {
                        const e = edges.find(edge => edge.sourceHandle === "handleN" && edge.target === currentNode.id);
                        if (e) {
                            currentNode = e.sourceNode!;
                        } else {
                            // no more nodes found
                            break;
                        }
                    } while (currentNode.id !== fromNode.id); // prevent looped lookup

                    // Search all nodes point to this NPC node
                    const upstreamNodes: Node<NodeData>[] = edges.filter(edge => edge.target === currentNode.id).map(edge => {
                        return edge.sourceNode!;
                    });

                    // Set new pointers on the node
                    upstreamNodes.forEach(node => {
                        switch (node.type) {
                            case "playerNode":
                                node.data.option?.insertPointerNames([newNodeName]);
                                break;
                            case "startNode":
                                node.data.conversation?.insertFirst([newNodeName]);
                                break;
                        }
                    });
                }
        }

        // Sync YAML to VSCode
        props.syncYaml();
    }, [project, getNode, getNewNodeID, setNodes, getNewLineID, edges, setEdges, nodes, props.syncYaml]);

    // Handle new Edge connected
    const onConnect = useCallback((params: Connection) => {
        console.log("onConnect:", params);
        if (!params) {
            return;
        }
        const sourceID = params.source || "";
        let sourceNode = getNode(sourceID);
        if (!sourceNode) {
            return;
        }

        // TODO: add pointers to the source node ...
        switch (sourceNode.type) {
            case "":
            // connection from start to npc
            // connection from player to npc
            // connection from npc to npc (else)
            // connection from npc to player
        }

        // UI
        let edge: Edge = {
            id: getNewLineID(),
            type: "smoothstep",
            markerEnd: { type: MarkerType.ArrowClosed },
            source: params.source || "",
            sourceHandle: params.sourceHandle || "",
            sourceNode: sourceNode,
            target: params.target || "",
            targetHandle: params.targetHandle || "",
            targetNode: getNode(params.target || ""),
            // deletable: true,
        };

        // Remove conflict edges
        // TODO: remove pointers as well
        const newEdges = removeLinesOnConnect(
            sourceNode,
            edges,
            sourceID,
            params.sourceHandle || ""
        );

        setEdges(addEdge(edge, newEdges || []));
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
        onEdgesDelete(searchEdges.filter(e => deletedNodes.some(n => e.source === n.id || e.target === n.id)));
        
        // Delete nodes and reconnect edges
        deletedNodes.forEach(item => {
            // Delete the nodes and
            props.conversation.deleteOption(item.data.option?.getType() || "", item.data.option?.getName() || "");

            // Find the upper and lower stream edges
            const upperEdges = searchEdges.filter(e => e.target === item.id); // it might have multiple connections going to a npc node
            const lowerEdge = searchEdges.find(e => e.sourceHandle === "handleN" && e.source === item.id);

            upperEdges.forEach(upperEdge => {
                const upperNode: Node<NodeData> | undefined = upperEdge?.sourceNode;

                // Reconnect edges for NPC's "else" nodes
                if (upperEdge && lowerEdge){
                    // YAML
                    // Iterate all downstream "else" nodes and find pointers that need to be set
                    const elseNodes: Node<NodeData>[] = [lowerEdge.targetNode!];
                    let currentNodeId: string = lowerEdge.target;
                    do {
                        const e = searchEdges.find(edge => edge.sourceHandle === "handleN" && edge.source === currentNodeId);
                        if (e) {
                            currentNodeId = e.target;
                            elseNodes.push(e.targetNode!);
                        } else {
                            // no more nodes found
                            break;
                        }
                    } while (currentNodeId !== lowerEdge.target); // prevent looped lookup
                    // Get all pointers and set it on source
                    const allPointers: string[] = elseNodes.map(n => n.data.option?.getName()!);
                    if (upperNode) {
                        switch (upperNode.type) {
                            case "startNode":
                                upperNode.data.conversation?.insertFirst(allPointers);
                                break;
                            case "playerNode":
                                upperNode.data.option?.insertPointerNames(allPointers);
                                break;
                            case "npcNode":
                                // npc->npc
                                // Search all source options / first, and set the pointers on them
                                // Steps:
                                // 1. Search the first NPC node
                                // 2. Search all nodes point to this NPC node
                                // 3. Set new pointers on the node

                                // Iterate and find the first NPC node
                                let currentNode: Node<NodeData> = upperNode;
                                do {
                                    const e = searchEdges.find(edge => edge.sourceHandle === "handleN" && edge.target === currentNode.id);
                                    if (e) {
                                        currentNode = e.sourceNode!;
                                    } else {
                                        // no more nodes found
                                        break;
                                    }
                                } while (currentNode.id !== upperNode.id); // prevent looped lookup

                                // Search all nodes point to this NPC node
                                const upstreamNodes: Node<NodeData>[] = searchEdges.filter(edge => edge.target === currentNode.id).map(edge => {
                                    return edge.sourceNode!;
                                });

                                // Set new pointers on the node
                                upstreamNodes.forEach(node => {
                                    switch (node.type) {
                                        case "playerNode":
                                            node.data.option?.insertPointerNames(allPointers);
                                            break;
                                        case "startNode":
                                            node.data.conversation?.insertFirst(allPointers);
                                            break;
                                    }
                                });
                        }
                    }

                    // UI
                    // Append the new edge to list
                    edges2.push({
                        ...upperEdge,
                        id: getNewLineID(searchEdges),
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

    const onSelectionChange = useCallback((changed: OnSelectionChangeParams) => {
        if (lastSelectedNodes === changed.nodes) {
            return;
        }
        // Highlight all related edges
        let nodeIDs: string[] = [];
        for (let i = 0; i < changed.nodes.length; i++) {
            let n = changed.nodes[i];
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
                // e.selected = false;
                e.zIndex = 0;
                e.markerEnd = { type: MarkerType.ArrowClosed };
                e.animated = false;
            }
        }
        setEdges(eds);
    }, [getEdges, setEdges]);

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
