import React from "react";
import { Input } from "antd";
import { InputProps } from "./Common";

export default function (props: InputProps) {
    return (
        <Input
            value={props.value as string}
            onChange={(e) => {
                props.onChange(e.target.value);
            }}
            placeholder={props.placeholder}
            size="small"
        />
    );
}