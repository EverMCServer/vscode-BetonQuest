import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import './styles.css'

export default memo(({ data }) => {
    const [getTrigger, setTrigger] = useState(false);
    const refreshUI = () => {
      setTrigger(!getTrigger);
    }
  
  
    const conditionsGet = () => {
        let arr = data['conditions'] || ['']
        if (arr.length == 0){
            return ['']
        }
        return arr;
    };
    const conditionAdd = () => {
        const arr = [...conditionsGet(), ''];
        data['conditions'] = arr;
        refreshUI();
    };
    const conditionDel = () => {
        const arr = [...conditionsGet()];
        arr.pop();
        data['conditions'] = arr;
        refreshUI();
    };
    const conditionUpdate = (index, value) => {
        const arr = [...conditionsGet()];
        arr[index] = value;
        data['conditions'] = arr;
        refreshUI();
    };

    return (
        <>
            <div style={{ display: 'flex', gap: 20 }}>
                <label>Conditions:</label>
                <button onClick={conditionDel} className="actionButton">-</button>
                <button onClick={conditionAdd} className="actionButton">+</button>
            </div>

            {conditionsGet().map((value, index) => (
                <input
                    key={index}
                    type="text"
                    placeholder={`condition ${index + 1}`}
                    value={value}
                    onChange={(e) => conditionUpdate(index, e.target.value)}
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
                id='handleY'
                type="source"
                position={Position.Bottom}
                style={{ background: '#00ff00' }}
            />
            <Handle
                id='handleN'
                type="source"
                position={Position.Right}
                style={{ background: '#ff0000' }}
            />
        </>
    );
});
