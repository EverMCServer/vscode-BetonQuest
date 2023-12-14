import React from "react";
import { InputNumber } from "antd";
import { InputProps } from "./Common";

export default function (props: InputProps) {
    return (
        <InputNumber
            defaultValue={props.defaultValue as number}
            value={props.value as number}
            onChange={(value) => {
                props.onChange(value);
            }}
            placeholder={props.placeholder}
            min={props.config?.min}
            max={props.config?.max}
            step={props.config?.step}
            size="small"
        />
    );
}