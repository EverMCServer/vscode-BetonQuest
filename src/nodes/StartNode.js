import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import './styles.css'

export default memo(({ data, isConnectable }) => {

  const [getNPCID, setNPCID] = useState('');
  const handleChange1 = (event) => {
    setNPCID(event.target.value);
  };

  const [getNPCName, setNPCName] = useState('');
  const handleChange2 = (event) => {
    setNPCName(event.target.value);
  };

  return (
    <>
      <div>
        Start
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
        <label>NPC ID</label>
        <input type="text" className="nodrag" value={getNPCID} onChange={handleChange1} style={{
          width: 150,
          height: 15,
        }} />
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
        <label>NPC Name</label>
        <input type="text" className="nodrag" value={getNPCName} onChange={handleChange2} style={{
          width: 150,
          height: 15,
        }} />
      </div>

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
