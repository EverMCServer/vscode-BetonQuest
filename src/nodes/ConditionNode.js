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

    return (
        <>
            <div>
                Condition
            </div>

            <input type="text" className="nodrag" value={textGet()} onChange={(e) => textUpdate(e.target.value)} style={{
                width: 170,
                height: 15,
            }} />

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
