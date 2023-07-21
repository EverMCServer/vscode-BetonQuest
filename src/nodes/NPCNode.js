import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import './styles.css'
import { Node, NodeProps } from 'reactflow';


export default memo(({ data, isConnectable }) => {
    const [getTrigger, setTrigger] = useState(false);
    const trigger = () => {
        setTrigger(!getTrigger);
    }


    const getText = () => {
        return data['text'] || '';
    };

    const getItems = () => {
        return data['items'] || [];
    };

    const handleChange = (event) => {
        data['text'] = event.target.value;
        trigger();
    };

    const handleAdd = () => {
        const newInputValues = [...getItems(), ''];
        data['items'] = newInputValues;
        trigger();
    };
    const handleDel = () => {
        const newInputValues = [...getItems()];
        newInputValues.pop();
        data['items'] = newInputValues;
        trigger();
    };
    const handleUpdate = (index, value) => {
        const newInputValues = [...getItems()];
        newInputValues[index] = value;
        data['items'] = newInputValues;
        trigger();
    };


    return (
        <>
            <div>
                NPC
            </div>

            <textarea
                className="nodrag"
                value={getText()}
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

            {getItems().map((value, index) => (
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
