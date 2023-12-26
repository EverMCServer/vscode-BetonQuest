import React, { useEffect, useState } from "react";
import { Button, Space } from "antd";
import TextArea from "antd/es/input/TextArea";
import { VscClose } from "react-icons/vsc";

import { InputProps } from "./Common";

export default function (props: InputProps) {
    // UI update trigger
    const [getTrigger, setTrigger] = useState(false);
    const refreshUI = () => {
        setTrigger(!getTrigger);
    };

    const valueArray = props.value as string[] || [""];

    const [focusIndex, setFocusIndex] = useState<number>();

    return (
        <Space
            direction="vertical"
            size={4}
            style={{ width: '-webkit-fill-available' }}
        >
            {valueArray.map((value, index) =>
                <Space.Compact
                    block
                    key={index}
                    style={{ width: '-webkit-fill-available' }}
                >
                    <TextArea
                        value={value}
                        onChange={(e) => {
                            const valueUpdate = valueArray;
                            valueUpdate[index] = e.target.value;
                            props.onChange(valueUpdate);
                            refreshUI();
                        }}
                        placeholder={props.placeholder}
                        autoFocus={index === focusIndex}
                        autoSize={{ minRows: props.config?.minRows || 2, maxRows: props.config?.maxRows || 6 }}
                        size="small"
                    />
                    {valueArray.length > 1 && <Button
                        style={{ height: 'inherit', background: 'none' }}
                        type="default"
                        size="small"
                        onClick={() => {
                            const valueUpdate = [...valueArray.slice(0, index), ...valueArray.slice(index + 1)];
                            props.onChange(valueUpdate);
                            refreshUI();
                        }}
                    >
                        <VscClose style={{ verticalAlign: 'middle' }} />
                    </Button>}
                </Space.Compact>
            )}
            <Button
                type="primary"
                size="small"
                onClick={() => {
                    const valueUpdate = valueArray;
                    valueUpdate.push("");
                    setFocusIndex(valueArray.length - 1);
                    props.onChange(valueUpdate);
                    refreshUI();
                }}
            >
                Add
            </Button>
        </Space>
    );
}