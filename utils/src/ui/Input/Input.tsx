import * as React from "react";
import { useEffect, useState } from "react";
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
    const [value, setValue] = useState("");
    useEffect(() => {
        setValue(props.value as string);
    }, [props.value]);

    return (
        <Input
            value={value || ""}
            onChange={(e) => {
                let v = e.target.value;
                // v = (props.defaultValue.length && !v.length) ? props.defaultValue : v;

                // Filter out unwanted input
                if (props.config?.allowedPatterns &&
                    !(props.config.allowedPatterns as (string | RegExp)[])
                        .some(element =>
                            (new RegExp(element)).test(v)
                        )
                ) {
                    return;
                }

                // Update value
                setValue(v);
                props.onChange(v);
            }}
            placeholder={props.placeholder}
            size="small"
        />
    );
}