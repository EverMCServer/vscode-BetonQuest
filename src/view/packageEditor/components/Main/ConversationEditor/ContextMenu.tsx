import { useCallback } from "react";
import * as React from "react";
import { Edge, Node, useReactFlow } from "reactflow";
import { NodeData } from "./Nodes";
import L from "../../../../../i18n/i18n";

interface ContextMenuProps {
  id: string;
  deleteNodes: (deletingNodes: Node<NodeData>[], updateFlowChart?: boolean) => {deletedNodes: Node<NodeData>[], deletedEdges: Edge[]};
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
}

export default function contextMenu({
  id,
  deleteNodes,
  top,
  left,
  right,
  bottom,
  ...props
}: ContextMenuProps) {
  const { getNode, getEdge } = useReactFlow<NodeData>();

  const deleteNode = useCallback(() => {
    const node = getNode(id);
    if (node) {
      deleteNodes([node], true);
    }
  }, [id, getNode, getEdge]);

  return (
    <div
      style={{ top, left, right, bottom }}
      className="context-menu"
      {...props}
    >
      <button onClick={deleteNode}>{L("delete")}</button>
    </div>
  );
}
