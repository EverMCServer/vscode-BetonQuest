import React from "react";
import { Input } from "antd";
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
                        // if (e.target.value.includes("\n")) {
                        //     return;
                        // }
                        let valueUpdate = props.value as string[] || [""];
                        valueUpdate[index] = e.target.value;
                        props.onChange(valueUpdate);
                    }}
                    placeholder={props.placeholder}
                    size="small"
                />
            )}
        </>
    );
}