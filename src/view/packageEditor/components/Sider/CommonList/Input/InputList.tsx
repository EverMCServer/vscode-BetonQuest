import React from "react";
import { Input } from "antd";
import { VscClose } from "react-icons/vsc";

import { InputProps } from "./Common";

export default function (props: InputProps) {
    const valueArray = props.value as string[] || [""];
    return (
        <>
            {valueArray.map((value, index) =>
                <Input
                    key={index}
                    value={value}
                    onChange={(e) => {
                        let valueUpdate = props.value as string[] || [""];
                        valueUpdate[index] = e.target.value;
                        props.onChange(valueUpdate);
                    }}
                    placeholder={props.placeholder}
                    size="small"
                    style={index > 0 ? { marginTop: 4 } : undefined}
                    onPressEnter={() => {
                        let valueUpdate = props.value as string[] || [""];
                        valueUpdate = [...valueUpdate.slice(0, index + 1), "", ...valueUpdate.slice(index + 1)];
                        props.onChange(valueUpdate);
                    }}
                    suffix={
                        valueArray.length > 1 && <VscClose
                            title="Remove"
                            onClick={() => {
                                let valueUpdate = props.value as string[] || [""];
                                valueUpdate = [...valueUpdate.slice(0, index), ...valueUpdate.slice(index + 1)];
                                props.onChange(valueUpdate);
                            }}
                        />
                    }
                />
            )}
        </>
    );
}