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
    useOnSelectionChange,
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
    const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
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

    // Handle Edge while connecting, style etc
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

        // TODO: Update / add pointers to conversation ...

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

        const newEdges = removeLinesOnConnect(
            sourceNode,
            edges,
            sourceID,
            params.sourceHandle || ""
        );

        setEdges(addEdge(edge, newEdges || []));
    }, [edges, getNewLineID, getNode, setEdges]);

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
                    // Remove old pointers
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

    // Handle Edge deletion
    const onEdgesDelete = useCallback((edges: Edge[]) => {
        console.log("onEdgesDelete:", edges);

        // Remove old pointers
        // Note: if target is NPC, remove till end (deal with "else")
        edges.forEach(oldEdge => {
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
        });

        // update yaml
        props.syncYaml();
    } , [props.syncYaml]);

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

    const onConnectEnd = useCallback(
        (event: MouseEvent | TouchEvent) => {
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
                type,
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

        // TODO: delete nodes one-by-one, so "else" can be properly connected

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
                switch (upperNode.type) {
                    case "startNode":
                        upperNode.data.conversation?.removeFirstTillEnd(item.data.option.getName());
                        break;
                        case "playerNode":
                            upperNode.data.option?.removePointerNamesTillEnd(item.data.option.getName());
                            break;
                        case "npcNode":
                            upperNode.data.option?.removePointerNames([item.data.option.getName()]);
                            break;
                }
            }

            // Reconnect edges for NPC's "else" nodes
            if (upperEdge && lowerEdge){
                // YAML
                // Iterate all "else" nodes and set pointers
                const elseNodes: Node[] = [lowerEdge.targetNode!];
                let currentNodeId: string = lowerEdge.target;
                do {
                    const e = edges2.find(edge => edge.sourceHandle === "handleN" && edge.source === currentNodeId);
                    if (e) {
                        currentNodeId = e.target;
                        elseNodes.push(e.targetNode!);
                    } else {
                        // no more nodes found
                        break;
                    }
                } while (currentNodeId !== lowerEdge.target); // prevent looped lookup
                // Get all pointers and set it on source
                const allPointers: string[] = elseNodes.map(n => (n.data as NodeData).option?.getName()!);
                if (upperNode) {
                    switch (upperNode.type) {
                        case "startNode":
                            upperNode.data.conversation?.insertFirst(allPointers);
                            break;
                        default:
                            upperNode.data.option?.insertPointerNames(allPointers);
                    }
                }

                // UI
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
    }, [getEdge, setEdges]);

    // useOnSelectionChange({ //
    //     onChange: ({ nodes, edges }) => {
    //         if (lastSelectedNodes === nodes) {
    //             return;
    //         }
    //         // Highlight all related edges
    //         let nodeIDs: string[] = [];
    //         for (let i = 0; i < nodes.length; i++) {
    //             let n = nodes[i];
    //             nodeIDs = [...nodeIDs, n.id];
    //         }
    //         let eds = getEdges();
    //         for (let i = 0; i < eds.length; i++) {
    //             let e = eds[i];
    //             if (nodeIDs.includes(e.source) || nodeIDs.includes(e.target)) {
    //                 e.selected = true;
    //                 e.zIndex = 1;
    //                 e.markerEnd = { type: MarkerType.ArrowClosed, color: "#ffb84e" };
    //                 e.animated = true;
    //             } else {
    //                 // e.selected = false;
    //                 e.zIndex = 0;
    //                 e.markerEnd = { type: MarkerType.ArrowClosed };
    //                 e.animated = false;
    //             }
    //         }
    //         setEdges(eds);
    //     },
    // });

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
                    {menu && <ContextMenu onClick={onPaneClick} deleteNodes={deleteNodes} {...menu} />}
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
