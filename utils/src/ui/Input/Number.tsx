import * as React from "react";
import { useEffect, useState } from "react";
import { InputNumber } from "antd";

import { InputProps } from "./Common";

/**
 * Input for number.
 * 
 * - `value` - Number value
 * - `placeholder` - Number Input placeholder
 * - `config`:
 *   - `min` - Minimum allowed value.
 *   - `max` - Maximum allowed value.
 *   - `step` - Increment step value. Default to 1.
 *   - `undefinedValue` - Output undefined when value equals to this. Usefull when decreasing to 0.
 *   - `nullValue` - Output null when value equals to this. Usefull when null/Nan means 1.
 * @param props 
 * @returns 
 */
export default function (props: InputProps) {
    const [value, setValue] = useState(props.value as number);
    useEffect(() => {
        let value = props.value as number;
        if (props.config?.nullValue && Number.isNaN(value)) {
            value = props.config?.nullValue;
        }
        setValue(value);
    }, [props.value]);

    return (
        <InputNumber
            defaultValue={props.defaultValue as number}
            value={value}
            onChange={(value) => {
                if (value === null || value === props.config?.undefinedValue) {
                    value = undefined;
                }
                // setValue(value);
                if (props.config?.nullValue && value === props.config?.nullValue) {
                    value = null;
                }
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