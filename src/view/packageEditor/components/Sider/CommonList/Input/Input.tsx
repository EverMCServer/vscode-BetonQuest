import React, { useEffect, useState } from "react";
import { Input } from "antd";

import { InputProps } from "./Common";

/**
 * Input for text.
 * 
 * - `value` - Text value
 * - `placeholder` - Number Input placeholder
 * - `config`:
 *   - `allowedPatterns` - Check input against RegExp.
 * @param props 
 * @returns 
 */
export default function (props: InputProps) {
    const [value, setValue] = useState(props.value as string);
    useEffect(() => {
        setValue(props.value as string);
    }, [props.value]);

    return (
        <Input
            value={value}
            onChange={(e) => {
                let value = e.target.value;
                // value = (props.defaultValue.length && !value.length) ? props.defaultValue : value;

                // Filter out unwanted input
                if (props.config?.allowedPatterns &&
                    !(props.config.allowedPatterns as (string | RegExp)[])
                        .some(element =>
                            (new RegExp(element)).test(value)
                        )
                ) {
                    return;
                }

                // Update value
                setValue(value);
                props.onChange(value);
            }}
            placeholder={props.placeholder}
            size="small"
        />
    );
}