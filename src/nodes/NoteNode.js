import React, { memo, useState } from 'react';
import './styles.css'

export default memo(() => {

    const [getText, setText] = useState('');

    const handleChange = (event) => {
        setText(event.target.value);
    };

    return (
        <>
            <div>
                Note
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
        </>
    );
});
