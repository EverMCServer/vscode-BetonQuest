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
                // Filter out unwanted input
                if (props.config?.allowedPatterns &&
                    !(props.config.allowedPatterns as (string | RegExp)[])
                        .some(element =>
                            (new RegExp(element)).test(e.target.value)
                        )
                ) {
                    return;
                }

                // Update value
                setValue(e.target.value);
                props.onChange(e.target.value);
            }}
            placeholder={props.placeholder}
            size="small"
        />
    );
}