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

  const text2Get = () => {
    return data['text2'] || '';
  };
  const text2Update = (value) => {
    data['text2'] = value;
    refreshUI();
  };

  return (
    <>
      <div>
        Start
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
        <label>File Name</label>
        <input type="text" className="nodrag" value={textGet()} onChange={(e) => textUpdate(e.target.value)} style={{
          width: 150,
          height: 15,
        }} />
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
        <label>NPC Name</label>
        <input type="text" className="nodrag" value={text2Get()} onChange={(e) => text2Update(e.target.value)} style={{
          width: 150,
          height: 15,
        }} />
      </div>

      <Handle
        id='handleOut'
        type="source"
        position={Position.Bottom}
        style={{ background: '#555' }}
      />
    </>
  );
});
