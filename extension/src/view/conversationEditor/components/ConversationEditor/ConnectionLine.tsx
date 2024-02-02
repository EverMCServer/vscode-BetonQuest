import * as React from "react";
import {
    ConnectionLineComponent,
    getSmoothStepPath,
    Position,
} from "reactflow";

const customEdge: ConnectionLineComponent = ({
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

    return (
        <path
            d={dAttr[0]}
            fill="none"
            className="react-flow__connection-path"
            style={connectionLineStyle}
        />
    );
};

export default customEdge;
