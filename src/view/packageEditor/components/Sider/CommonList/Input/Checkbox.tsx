import React from "react";
import { Checkbox } from "antd";
import { InputProps } from "./Common";

export default function (props: InputProps) {
    return (
        <Checkbox
            checked={props.value as boolean}
            onChange={(e) => {
                props.onChange(e.target.checked);
            }}
        />
    );
}