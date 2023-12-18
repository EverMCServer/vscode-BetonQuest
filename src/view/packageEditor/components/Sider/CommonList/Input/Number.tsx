import React, { useEffect, useState } from "react";
import { InputNumber } from "antd";

import { InputProps } from "./Common";

export default function (props: InputProps) {
    const [value, setValue] = useState(props.value as number);
    useEffect(() => {
        setValue(props.value as number);
    }, [props.value]);

    return (
        <InputNumber
            defaultValue={props.defaultValue as number}
            value={value}
            onChange={(value) => {
                setValue(value);
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