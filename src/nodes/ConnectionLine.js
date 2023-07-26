import React from 'react';
import { getSmoothStepPath, Position } from 'reactflow';

export default ({
    fromX,
    fromY,
    fromPosition,
    toX,
    toY,
    connectionLineStyle,
}) => {

    const pathParams = {
        sourceX: fromX,
        sourceY: fromY,
        sourcePosition: fromPosition,
        targetX: toX,
        targetY: toY,
        targetPosition: Position.Top,
    };

    let dAttr = getSmoothStepPath({
        ...pathParams,
        borderRadius: 0,
    });
    return <path d={dAttr[0]} fill="none" className="react-flow__connection-path" style={connectionLineStyle} />;
};
