import * as React from "react";
import { useEffect, useState } from "react";
import { Checkbox } from "antd";
import { InputProps } from "./Common";

export default function (props: InputProps) {
    const [value, setValue] = useState(props.value as boolean);
    useEffect(() => {
        setValue(props.value as boolean);
    }, [props.value]);

    return (
        <Checkbox
            checked={value}
            onChange={(e) => {
                setValue(e.target.checked);
                props.onChange(e.target.checked);
            }}
        />
    );
}