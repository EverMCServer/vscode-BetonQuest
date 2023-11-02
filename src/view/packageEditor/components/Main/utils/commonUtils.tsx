import { Node, Edge } from "reactflow";
import { NodeData } from "../components/Nodes";

export function connectionAvaliable(
    sourceType: string,
    sourceHandle: string,
    targetType: string,
    targetHandle: string
) {
    if (
        sourceType === "startNode" &&
        sourceHandle === "handleOut" &&
        targetType === "npcNode" &&
        targetHandle === "handleIn"
    ) {
        return true;
    } else if (
        sourceType === "npcNode" &&
        sourceHandle === "handleOut" &&
        targetType === "playerNode" &&
        targetHandle === "handleIn"
    ) {
        return true;
    } else if (
        sourceType === "playerNode" &&
        sourceHandle === "handleOut" &&
        targetType === "npcNode" &&
        targetHandle === "handleIn"
    ) {
        return true;
    } else if (
        sourceType === "npcNode" &&
        sourceHandle === "handleN" &&
        targetType === "npcNode" &&
        targetHandle === "handleIn"
    ) {
        return true;
    }
    return false;
}

export function logError(str: string) {
    console.log("Error:", str);
}

export function logWarning(str: string) {
    console.log("Warning:", str);
}

export function arrayAppend<T>(arr: T[] = [], obj: T | null): T[] {
    if (!obj) {
        return arr;
    }
    return [...arr, obj];
}

export function downloadImage(dataUrl: string) {
    const a = document.createElement("a");
    a.setAttribute("download", "BetonQuest.jpg");
    a.setAttribute("href", dataUrl);
    a.click();
}

export function getConflictEdges(
    sourceNode: Node, // source node
    sourceHandle: string,
    searchEdges: Edge[] // all edges
): Edge[] {
    let conflictEdges: Edge[] = [];
    switch (sourceNode.type) {
        case "startNode":
            conflictEdges = searchEdges.filter((item) => item.source === sourceNode.id);
            break;
        case "playerNode":
            conflictEdges = searchEdges.filter((item) => item.source === sourceNode.id);
            break;
        case "npcNode":
            if (sourceHandle === "handleN") {
                conflictEdges = searchEdges.filter((item) => item.source === sourceNode.id && item.sourceHandle === "handleN");
            }
            break;
    }
    return conflictEdges;
}

export function addPointersToUpstream(
    sourceNode: Node<NodeData>,
    targetNode: Node<NodeData>,
    pointersToAdd: string[],
    searchEdges: Edge[]
) {
    // 1. Set pointers on upstream options / "first"
    // 2. Lookup upstream nodes, if upperstream is npc->npc
    switch (sourceNode.type) {
        case "startNode":
            sourceNode.data.conversation?.insertFirst(pointersToAdd);
            break;
        case "playerNode":
            sourceNode.data.option?.insertPointerNames(pointersToAdd);
            break;
        case "npcNode":
            switch (targetNode.type) {
                case "playerNode":
                    sourceNode.data.option?.insertPointerNames(pointersToAdd);
                    break;
                case "npcNode":
                    // npc->npc
                    // Search all source options / first, and set the pointers on them
                    // Steps:
                    // 1. Search the first NPC node
                    // 2. Search all nodes point to this NPC node
                    // 3. Set new pointers on the node

                    // Iterate and find the source nodes
                    const upstreamNodes = getUpstreamNodes(sourceNode, searchEdges);

                    // Set new pointers on the node
                    upstreamNodes.forEach(node => {
                        switch (node.type) {
                            case "playerNode":
                                node.data.option?.insertPointerNames(pointersToAdd);
                                break;
                            case "startNode":
                                node.data.conversation?.insertFirst(pointersToAdd);
                                break;
                        }
                    });
            }
    }
}

// Function to search upstream nodes. Mainly deal with "npc->npc" else nodes
export function getUpstreamNodes<T = any>(currentNode: Node<T>, searchEdges: Edge[]): Node<T>[] {
    const result: Node<T>[] = [];

    // get upstream nodes
    const edges = searchEdges.filter(edge => edge.target === currentNode.id); // && edge.sourceHandle === "handleN"
    edges.forEach(e => {
        if (e.sourceNode) {
            if (e.sourceHandle === "handleN") {
                // npc->npc
                // iterate
                result.push(...getUpstreamNodes(e.sourceNode, searchEdges.filter(edge => edges.every(e => edge.id !== e.id))));
            } else {
                result.push(e.sourceNode as Node<T>);
            }
        }
    });

    return result;
};

// Get downstream nodes for npc->npc nodes
export function getDownstreamNpcNodes<T = any>(
    startNode: Node<T>,
    searchEdges: Edge[]
): Node<T>[] {
    const downstreamNodes = [startNode];
    let currentNodeId: string = startNode.id;
    do {
        const e = searchEdges.find(edge => edge.sourceHandle === "handleN" && edge.source === currentNodeId);
        if (e) {
            currentNodeId = e.target;
            downstreamNodes.push(e.targetNode!);
        } else {
            // no more nodes found
            break;
        }
    } while (currentNodeId !== startNode.id); // prevent looped lookup, if any

    return downstreamNodes;
}

// Detect looped connection, for npc->npc connection mainly
export function isConnectionLooped<T>(sourceNode: Node<T>, targetNode: Node<T>, searchEdges: Edge[]): boolean {
    // Get where the target node sit
    const edges = searchEdges.filter(edge => edge.source === targetNode.id);

    // Skip if connection type switched, e.g. npc->player
    if (sourceNode.type !== targetNode.type) {
        return false;
    }

    // Try to look up the source node from downstream
    let result: boolean = false;
    result = edges.some(edge =>
        (edge.target === sourceNode.id) ||
        isConnectionLooped(sourceNode, edge.targetNode!, searchEdges)
    );

    return result;
}
