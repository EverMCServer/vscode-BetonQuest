import { useCallback } from "react";
import * as React from "react";
import { useReactFlow } from "reactflow";
import Conversation from "../../../../../betonquest/Conversation";

interface ContextMenuProps {
  id: string;
  conversation: Conversation;
  syncYaml: (delay?: number) => void;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
}

export default function contextMenu({
  id,
  syncYaml,
  conversation,
  top,
  left,
  right,
  bottom,
  ...props
}: ContextMenuProps) {
  const { setNodes, setEdges } = useReactFlow();

  const deleteNode = useCallback(() => {
    // Prevent start node from being deleted
    if (id === "startNodeID") {
      return;
    }
    // Remove the nodes and related edges
    setNodes((nodes) => nodes.filter((node) => {
      if (node.id === id) {
        // Delete the option from the Conversation
        // conversation.deleteOption(id.endsWith("npcNode_")?"NPC_options":"player_options", id.split("_")[1]);
        conversation.deleteOption(node.data.option?.getType() || "", node.data.option?.getName() || "");
        return false;
      } else {
        // Keep the wanted nodes
        return true;
      }
    }));
    setEdges((edges) => edges.filter((edge) => edge.source !== id));
    // TODO: If source === "startNode", reconnect other "else" nodes
    // Sync the Conversation
    syncYaml();
  }, [id, setNodes, setEdges]);

  return (
    <div
      style={{ top, left, right, bottom }}
      className="context-menu"
      {...props}
    >
      <button onClick={deleteNode}>delete</button>
    </div>
  );
}
