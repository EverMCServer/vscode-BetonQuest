import React from "react";
import TextArea from "antd/es/input/TextArea";
import { InputProps } from "./Common";

export default function (props: InputProps) {
    return (
        <TextArea
            value={props.value as string}
            onChange={(e) => {
                // if (e.target.value.includes("\n")) {
                //     return;
                // }
                props.onChange(e.target.value);
            }}
            placeholder={props.placeholder}
            autoSize={{ minRows: props.config?.minRows || 2, maxRows: props.config?.maxRows || 6 }}
            size="small"
        />
    );
}