import React from 'react';

export default () => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside>
      <div className="description">Drag these nodes to right.</div>
      <div className="dndnode" onDragStart={(event) => onDragStart(event, 'startNode')} draggable>
        Start
      </div>
      <div className="dndnode" onDragStart={(event) => onDragStart(event, 'npcNode')} draggable>
        NPC
      </div>
      <div className="dndnode" onDragStart={(event) => onDragStart(event, 'playerNode')} draggable>
        Player
      </div>
    </aside>
  );
};
