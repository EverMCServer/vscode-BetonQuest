import React, { useEffect, useState } from "react";
import { Select } from "antd";

import { InputProps } from "./Common";
import { DefaultOptionType } from "antd/es/select";

/**
 * Input for custom selection.
 * 
 * - `value` - string. Selected value.
 * - `placeholder` - string. Placeholder text when nothing is selected.
 * - `config`:
 *   - `options` - ({ label: string, value: string } & DefaultOptionType)[]. Options to chose from.
 * @param props 
 * @returns 
 */
export default function (props: InputProps) {
    const [value, setValue] = useState(props.value as string);
    useEffect(() => {
        setValue(props.value as string);
    }, [props.value]);

    return (
        <Select
            value={value}
            options={props.config.options as DefaultOptionType[]}
            onChange={(e) => {
                setValue(e);
                props.onChange(e);
            }}
            showSearch
            filterOption={(input, option) => {
                return option?.value?.toString().toUpperCase().includes(input.toUpperCase()) || option?.label?.toString().toUpperCase().includes(input.toUpperCase()) || false;
            }}
            notFoundContent={null}
            popupMatchSelectWidth={false}
            placeholder={props.placeholder}
            allowClear={props.config?.allowClear}
            size="small"
            style={{ width: '100%' }}
        />
    );
}