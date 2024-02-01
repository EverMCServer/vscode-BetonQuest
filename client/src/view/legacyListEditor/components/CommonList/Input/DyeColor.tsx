import React, { useEffect, useState } from "react";
import { ColorPicker, Select, Space } from "antd";
import { DefaultOptionType } from "antd/es/select";

import { InputProps } from "./Common";
import DYE_COLOR_LIST from "../../../../../bukkit/Data/DyeColorList";

const bukkitOptions = DYE_COLOR_LIST.map(e => {
    return {
        label: <Space direction="horizontal"><div style={{ width: 14, height: 14, background: '#'+e.getColor()}}></div><div>{e.getBukkitId()} (0x{e.getColor()})</div></Space>, // TODO: i18n
        value: e.getBukkitId()
    } as {
        label: string;
        value: string;
    } & DefaultOptionType;
});

/**
 * Input for Bukkit's Color picking.
 * 
 * - `value` - string. Bukkit's color name, e.g. `WHITE`.
 * - `placeholder` - string. Placeholder text when nothing is selected.
 * - `config`:
 *   - `allowClear` - boolean. Whether to allow clearing the selection and return undefined.
 * @param props 
 * @returns 
 */
export default function (props: InputProps) {
    const [options, setOptions] = useState(bukkitOptions);
    const [value, setValue] = useState(props.value as string);
    useEffect(() => {
        setValue(props.value);
    }, [props.value]);

    return (
        <Select
            value={value?.toUpperCase()}
            // defaultValue={props.value}
            defaultActiveFirstOption={false}
            // onSelect={(e) => {
            //     props.onChange(e);
            // }}
            onChange={(e) => {
                setValue(e);
                props.onChange(e);
            }}
            options={options}
            showSearch
            onSearch={searchString => {
                if (
                    searchString.length > 0
                    && !bukkitOptions.some(e => e.label === searchString.toUpperCase())
                ) {
                    setOptions([{ value: searchString, label: searchString }, ...bukkitOptions]);
                } else {
                    setOptions(bukkitOptions);
                }
            }}
            filterOption={(input, option) => {
                try {
                    const regexp = new RegExp(input, 'mi');
                    return option?.label ? regexp.test(option.value) || regexp.test(option.label) : false;
                } catch {
                    return false;
                }
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