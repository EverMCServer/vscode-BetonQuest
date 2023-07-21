import React, { memo, useState } from 'react';
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
                Note
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
        </>
    );
});
