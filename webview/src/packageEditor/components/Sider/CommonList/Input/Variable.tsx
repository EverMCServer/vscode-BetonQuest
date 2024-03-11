import * as React from "react";
import { useEffect, useState } from "react";
import { Flex, Input } from "antd";

import L from "betonquest-utils/i18n/i18n";
import { InputProps } from "./Common";

/**
 * Input for variable.
 * 
 * - `value` - string. Variable, including leading and tailing `%`.
 * - `onChange` - (value: string) => void. Called when the value changes.
 * - `placeholder` - string. Placeholder when variable is empty. Default is `(Variable)`.
 * - `type` - MandatoryArgumentType | OptionalArgumentType. What is the type of the value if it is not a variable, to determine the input format.
 * @param props 
 * @returns 
 */
export default function (props: InputProps) {
    const [value, setValue] = useState("");
    useEffect(() => {
        // Parse variable string
        if (typeof props.value === 'string' && props.value.startsWith("%") && props.value.endsWith("%")) {
            setValue(props.value.substring(1, props.value.length - 1));
        } else {
            setValue("");
        }
    }, [props.value]);

    // Parsing variable string

    return (
        <Flex justify="space-between" gap={4} >
            %
            <Input
                value={value || ""}
                onChange={(e) => {
                    let v = e.target.value;

                    // Filter out unwanted input
                    if (!/^\S*$/.test(v)
                    ) {
                        return;
                    }

                    // Update value
                    setValue(v);
                    props.onChange('%' + v + '%');
                }}
                placeholder={props.placeholder || L("*.commonList.editor.default.toggleVariablePlaceholder")}
                size="small"
            />
            %
        </Flex>
    );
}