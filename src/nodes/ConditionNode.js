import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import './styles.css'

export default memo(({ data, isConnectable }) => {

    const [getText, setText] = useState('');
    const handleChange = (event) => {
        setText(event.target.value);
    };

    return (
        <>
            <div>
                Condition
            </div>

            <input type="text" className="nodrag" value={getText} onChange={handleChange} style={{
                width: 170,
                height: 15,
            }} />

            <Handle
                id='handleIn'
                type="target"
                position={Position.Top}
                style={{ background: '#555' }}
                onConnect={(params) => console.log('handle onConnect', params)}
                isConnectable={isConnectable}
            />
            <Handle
                id='handleY'
                type="source"
                position={Position.Bottom}
                style={{ background: '#00ff00' }}
                onConnect={(params) => console.log('handle onConnect', params)}
                isConnectable={isConnectable}
            />
            <Handle
                id='handleN'
                type="source"
                position={Position.Right}
                style={{ background: '#ff0000' }}
                onConnect={(params) => console.log('handle onConnect', params)}
                isConnectable={isConnectable}
            />
        </>
    );
});
