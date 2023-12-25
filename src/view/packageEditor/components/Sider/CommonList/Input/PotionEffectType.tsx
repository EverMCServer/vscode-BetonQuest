import React, { useEffect, useState } from "react";
import { Select } from "antd";

import { InputProps } from "./Common";
import POTION_EFFECT_TYPE_LIST from "../../../../../../bukkit/Data/PotionEffectTypeList";

const bukkitOptions = POTION_EFFECT_TYPE_LIST.map(e => {
    return {
        label: e.getBukkitId(), // TODO: i18n
        value: e.getBukkitId()
    };
});

export default function (props: InputProps) {
    const [options, setOptions] = useState(bukkitOptions);
    const [value, setValue] = useState(props.value as string);
    useEffect(() => {
        setValue(props.value);
    }, [props.value]);

    return (
        <Select
            value={value}
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
            size="small"
            style={{ width: '100%' }}
        />
    );
}