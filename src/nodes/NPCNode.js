import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import './styles.css'
import { Node, NodeProps } from 'reactflow';


export default memo(({ data, isConnectable }) => {

    const [getText, setText] = useState('');
    const handleChange = (event) => {
        setText(event.target.value);
    };

    const [inputValues, setInputValues] = useState([]);
    const handleAdd = () => {
        const newInputValues = [...inputValues, ''];
        setInputValues(newInputValues);
    };
    const handleDel = () => {
        const newInputValues = [...inputValues];
        newInputValues.pop();
        setInputValues(newInputValues);
    };
    const handleUpdate = (index, value) => {
        const newInputValues = [...inputValues];
        newInputValues[index] = value;
        setInputValues(newInputValues);
    };

    return (
        <>
            <div>
                NPC
            </div>

            <textarea
                className="nodrag"
                value={getText}
                onChange={handleChange}
                style={{
                    width: 170,
                    minHeight: 50,
                    maxHeight: 200,
                    resize: 'vertical',
                }}
            />

            <div style={{ display: 'flex', gap: 20 }}>
                <label>Events:</label>
                <button onClick={handleDel}>-</button>
                <button onClick={handleAdd}>+</button>
            </div>

            {inputValues.map((value, index) => (
                <input
                    key={index}
                    type="text"
                    placeholder={`event ${index + 1}`}
                    value={value}
                    onChange={(e) => handleUpdate(index, e.target.value)}
                    style={{
                        width: 170,
                        height: 15,
                    }}
                />
            ))}

            <Handle
                id='handleIn'
                type="target"
                position={Position.Top}
                style={{ background: '#555' }}
                onConnect={(params) => console.log('handle onConnect', params)}
                isConnectable={isConnectable}
            />
            <Handle
                id='handleOut'
                type="source"
                position={Position.Bottom}
                style={{ background: '#555' }}
                onConnect={(params) => console.log('handle onConnect', params)}
                isConnectable={isConnectable}
            />
        </>
    );
});
