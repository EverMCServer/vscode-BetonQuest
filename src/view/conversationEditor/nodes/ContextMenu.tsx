import { useCallback } from "react";
import * as React from "react";
import { useReactFlow } from "reactflow";

interface ContextMenuProps {
  id: string;
  downloadYML: () => void;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
}

export default function contextMenu({
  id,
  downloadYML,
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
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    setEdges((edges) => edges.filter((edge) => edge.source !== id));
    // Update Yaml
    window.setTimeout(()=>{
      downloadYML();
    }, 1000);
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
