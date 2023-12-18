import React, { useEffect, useState } from "react";
import { Input } from "antd";

import { InputProps } from "./Common";

export default function (props: InputProps) {
    const [value, setValue] = useState(props.value as string);
    useEffect(() => {
        setValue(props.value as string);
    }, [props.value]);

    return (
        <Input
            value={value}
            onChange={(e) => {
                setValue(e.target.value);
                props.onChange(e.target.value);
            }}
            placeholder={props.placeholder}
            size="small"
        />
    );
}