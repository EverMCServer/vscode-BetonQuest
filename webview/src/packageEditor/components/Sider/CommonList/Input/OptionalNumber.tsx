import React, { useEffect, useState } from "react";
import { Checkbox, InputNumber } from "antd";

import { InputProps } from "./Common";

/**
 * Optional Number Input
 * = Checkbox + Number.
 * 
 * - `value` - Number value, could be number, undefined (=unchecked), or null (=checked but no value)
 * - `placeholder` - Number Input placeholder
 * - `config`:
 *   - `min` - Minimum allowed value.
 *   - `max` - Maximum allowed value.
 *   - `step` - Increment step value. Default to 1.
 *   - `setMinToNull` - If true, minimum value will become null.
 * @param props InputProps
 * @returns React.JSX.Element
 */
export default function (props: InputProps) {
    const [value, setValue] = useState<number | undefined>(props.value as number);
    useEffect(() => {
        setValue(props.value as number);
    }, [props.value]);

    return (
        <>
            <Checkbox
                checked={value !== undefined}
                onChange={(e) => {
                    if (e.target.checked) {
                        // setValue(props.defaultValue);
                        props.onChange(null);
                    } else {
                        // setValue(undefined);
                        props.onChange(undefined);
                    }
                }}
            />
            {value !== undefined ? <InputNumber
                defaultValue={props.defaultValue as number}
                value={Number.isNaN(value) ? null : value}
                onChange={(value) => {
                    if (props.config?.setMinToNull && value === props.config.min) {
                        value = null;
                    }
                    // setValue(value);
                    props.onChange(value);
                }}
                placeholder={props.placeholder}
                min={props.config.min}
                max={props.config.max}
                size="small"
                style={{
                    marginLeft: 8
                }}
            /> : undefined}
        </>
    );
}