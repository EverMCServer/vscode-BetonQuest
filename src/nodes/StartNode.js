import React, { memo, useState } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
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

  const { getNode } = useReactFlow();
  const isConnectable = (line) => {
      let source = getNode(line['source'])
      let sourceType = source['type']
      let sourceHandle = line['sourceHandle']
      let target = getNode(line['target'])
      let targetType = target['type']
      let targetHandle = line['targetHandle']

      if (sourceType == 'startNode' && sourceHandle == 'handleOut' && targetType == 'npcNode' && targetHandle == 'handleIn') {
          return true
      } else if (sourceType == 'npcNode' && sourceHandle == 'handleOut' && targetType == 'playerNode' && targetHandle == 'handleIn') {
          return true
      } else if (sourceType == 'playerNode' && sourceHandle == 'handleOut' && targetType == 'npcNode' && targetHandle == 'handleIn') {
          return true
      } else if (sourceType == 'npcNode' && sourceHandle == 'handleN' && targetType == 'npcNode' && targetHandle == 'handleIn') {
          return true
      }
      return false
  };

  return (
    <div style={{ padding: 5 }}>
      <div>
        Start
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
        <label>File Name:</label>

      </div>
      <div>
        <input type="text" className="nodrag" value={textGet()} onChange={(e) => textUpdate(e.target.value)} style={{
          width: 170,
          height: 15,
        }} />
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
        <label>NPC Name:</label>

      </div>
      <div>
        <input type="text" className="nodrag" value={text2Get()} onChange={(e) => text2Update(e.target.value)} style={{
          width: 170,
          height: 15,
        }} />
      </div>

      <Handle
        id='handleOut'
        type="source"
        position={Position.Bottom}
        style={{ background: '#555' }}
        isValidConnection={(e) => isConnectable(e)}
      />
    </div>
  );
});
