import React, { useEffect, useState } from "react";
import { Input } from "antd";

import { InputProps } from "./Common";

/**
 * Input for variable.
 * 
 * - `value` - string. Variable, including leading and tailing `%`.
 * - `onChange` - (value: string) => void. Called when the value changes.
 * - `type` - MandatoryArgumentType | OptionalArgumentType. What is the type of the value if it is not a variable, to determine the input format.
 * @param props 
 * @returns 
 */
export default function (props: InputProps) {
    const [value, setValue] = useState("");
    useEffect(() => {
        setValue(props.value as string);
    }, [props.value]);

    // Parsing variable string

    return (<div>
        %
        <Input
            value={value || ""}
            onChange={(e) => {
                let v = e.target.value;

                // escape space ` `
                v = v.replace(' ', '_');

                // Update value
                setValue(v);
                props.onChange(v);
            }}
            placeholder={props.placeholder}
            size="small"
        />
        %
    </div>);
}