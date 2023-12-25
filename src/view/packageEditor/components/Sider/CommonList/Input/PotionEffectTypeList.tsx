import React, { useEffect, useState } from "react";
import { Button, Select, Space } from "antd";
import { VscClose } from "react-icons/vsc";

import { InputProps } from "./Common";
import POTION_EFFECT_TYPE_LIST from "../../../../../../bukkit/Data/PotionEffectTypeList";
import { DefaultOptionType } from "antd/es/select";

const bukkitOptions = POTION_EFFECT_TYPE_LIST.map(e => {
    return {
        label: e.getBukkitId(), // TODO: i18n
        value: e.getBukkitId()
    } as {
        label: string;
        value: string;
    } & DefaultOptionType;
});


export default function (props: InputProps) {
    const [options, setOptions] = useState(bukkitOptions);

    const [valueArray, setValueArray] = useState(props.value as string[]);
    useEffect(() => {
        setValueArray(props.value);
    }, [props.value]);

    const onChange = (value: string, index: number) => {
        // Update value
        const valueUpdate = valueArray;
        valueUpdate[index] = value;
        setValueArray(valueUpdate);
        props.onChange(valueUpdate);
        // Disable selected options from the available list
        setOptions(bukkitOptions.map(option => {
            if (valueUpdate.some(v => v === option.value)) {
                option.disabled = true;
            }
            return option;
        }));
    };

    const onSearch = (searchString: string) => {
        if (
            searchString.length > 0
            && !bukkitOptions.some(e => e.label === searchString.toUpperCase())
        ) {
            setOptions([{ value: searchString, label: searchString }, ...bukkitOptions]);
        } else {
            setOptions(bukkitOptions);
        }
    };

    const onFilterOption = (input: string, option: { label: string, value: string } | undefined) => {
        try {
            const regexp = new RegExp(input, 'mi');
            return option?.label ? regexp.test(option.value) || regexp.test(option.label) : false;
        } catch {
            return false;
        }
    };

    const onRemove = (index: number) => {
        // Update value
        const valueUpdate = [...valueArray.slice(0, index), ...valueArray.slice(index + 1)];
        setValueArray(valueUpdate);
        props.onChange(valueUpdate);
        // Disable selected options from the available list
        setOptions(bukkitOptions.map(option => {
            if (valueUpdate.some(v => v === option.value)) {
                option.disabled = true;
            }
            return option;
        }));
    };

    const [focusIndex, setFocusIndex] = useState<number>();

    return (
        <Space
            direction="vertical"
            size={4}
            style={{ width: '-webkit-fill-available' }}
        >
            {valueArray.map((value, index) =>
                <Space.Compact
                    key={index}
                    style={{ width: '-webkit-fill-available' }}
                >
                    <Select
                        value={value}
                        defaultActiveFirstOption={false}
                        onChange={e => onChange(e, index)}
                        options={options}
                        showSearch
                        onSearch={onSearch}
                        filterOption={onFilterOption}
                        notFoundContent={null}
                        popupMatchSelectWidth={false}
                        placeholder={props.placeholder}
                        autoFocus={index === focusIndex}
                        defaultOpen={index === focusIndex}
                        size="small"
                        style={{ width: '100%' }}
                    />
                    <Button
                        style={{ height: 'inherit', background: 'none' }}
                        type="default"
                        size="small"
                        onClick={() => onRemove(index)}
                    >
                        <VscClose style={{ verticalAlign: 'middle' }} />
                    </Button>
                </Space.Compact>
            )}
            <Button
                type="primary"
                size="small"
                onClick={() => {
                    const valueUpdate = valueArray;
                    valueUpdate.push("");
                    setFocusIndex(valueArray.length - 1);
                    props.onChange(valueUpdate);
                }}
            >
                Add
            </Button>
        </Space>
    );
}