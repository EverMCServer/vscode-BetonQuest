import React, { useEffect, useState } from "react";
import TextArea from "antd/es/input/TextArea";

import { InputProps } from "./Common";

export default function (props: InputProps) {
    const [value, setValue] = useState(props.value as string);
    useEffect(() => {
        setValue(props.value as string);
    }, [props.value]);

    return (
        <TextArea
            value={value}
            onChange={(e) => {
                setValue(e.target.value);
                props.onChange(e.target.value);
            }}
            placeholder={props.placeholder}
            autoSize={{ minRows: props.config?.minRows || 2, maxRows: props.config?.maxRows || 6 }}
            size="small"
        />
    );
}