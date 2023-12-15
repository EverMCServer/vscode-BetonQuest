import React from "react";
import { Button, Space } from "antd";
import TextArea from "antd/es/input/TextArea";
import { VscClose } from "react-icons/vsc";

import { InputProps } from "./Common";

export default function (props: InputProps) {
    const valueArray = props.value as string[] || [""];
    return (
        <>
            {valueArray.map((value, index) =>
                <Space.Compact
                    block
                    key={index}
                    style={index > 0 ? { marginTop: 4 } : undefined}
                >
                    <TextArea
                        value={value}
                        onChange={(e) => {
                            let valueUpdate = props.value as string[] || [""];
                            valueUpdate[index] = e.target.value;
                            props.onChange(valueUpdate);
                        }}
                        placeholder={props.placeholder}
                        autoSize={{ minRows: props.config?.minRows || 2, maxRows: props.config?.maxRows || 6 }}
                        size="small"
                    />
                    {valueArray.length > 1 && <Button
                        type="default"
                        size="small"
                        onClick={() => {
                            let valueUpdate = props.value as string[] || [""];
                            valueUpdate = [...valueUpdate.slice(0, index), ...valueUpdate.slice(index + 1)];
                            props.onChange(valueUpdate);
                        }}
                    >
                        <VscClose />
                    </Button>}
                </Space.Compact>
            )}
            <div style={{ marginTop: 4 }}>
                <Button
                    type="primary"
                    size="small"
                    onClick={() => {
                        let valueUpdate = props.value as string[] || [""];
                        valueUpdate.push("");
                        props.onChange(valueUpdate);
                    }}
                >
                    Add
                </Button>
            </div>
        </>
    );
}