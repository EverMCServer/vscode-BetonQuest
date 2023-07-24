import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from 'reactflow';

import './buttonedge.css';

const onEdgeClick = (evt, id) => {
  evt.stopPropagation();
  alert(`remove ${id}`);
};

export default function CustomEdge(props) {
  const id = props.id;
  const sourceX = props.sourceX;
  const sourceY = props.sourceY;
  const targetX = props.targetX;
  const targetY = props.targetY;
  const sourcePosition = props.sourcePosition;
  const targetPosition = props.targetPosition;
  let style = props.style;
  const markerEnd = props.markerEnd;

  if (style === undefined) {
    style = {};
  }

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            // everything inside EdgeLabelRenderer has no pointer events by default
            // if you have an interactive element, set pointer-events: all
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          {/* <button className="edgebutton" onClick={(event) => onEdgeClick(event, id)}>
            ×
          </button> */}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
