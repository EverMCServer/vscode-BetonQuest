import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import './styles.css'


export default memo(({ data }) => {
    const [getTrigger, setTrigger] = useState(false);
    const refreshUI = () => {
        setTrigger(!getTrigger);
    }


    const textGet = () => {
        return data['text'] || '';
    };
    const textUpdate = (value) => {
        data['text'] = value;
        refreshUI();
    };

    const eventsGet = () => {
        return data['events'] || [];
    };
    const eventAdd = () => {
        const arr = [...eventsGet(), ''];
        data['events'] = arr;
        refreshUI();
    };
    const eventDel = () => {
        const arr = [...eventsGet()];
        arr.pop();
        data['events'] = arr;
        refreshUI();
    };
    const eventUpdate = (index, value) => {
        const arr = [...eventsGet()];
        arr[index] = value;
        data['events'] = arr;
        refreshUI();
    };


    return (
        <>
            <div>
                Player
            </div>

            <textarea
                className="nodrag"
                value={textGet()}
                onChange={(e) => textUpdate(e.target.value)}
                style={{
                    width: 170,
                    minHeight: 50,
                    maxHeight: 200,
                    resize: 'vertical',
                }}
            />

            <div style={{ display: 'flex', gap: 20 }}>
                <label>Events:</label>
                <button onClick={eventDel} className="actionButton">-</button>
                <button onClick={eventAdd} className="actionButton">+</button>
            </div>

            {eventsGet().map((value, index) => (
                <input
                    key={index}
                    type="text"
                    placeholder={`event ${index + 1}`}
                    value={value}
                    onChange={(e) => eventUpdate(index, e.target.value)}
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
            />
            <Handle
                id='handleOut'
                type="source"
                position={Position.Bottom}
                style={{ background: '#555' }}
            />
        </>
    );
});
