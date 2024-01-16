import React, { useEffect, useState } from "react";
import { Button, InputNumber, Select, Space, Tooltip } from "antd";
import { DefaultOptionType } from "antd/es/select";
import { VscClose } from "react-icons/vsc";

import L from "../../../../../../i18n/i18n";
import { InputProps } from "./Common";
import ENTITY_TYPE_LIST from "../../../../../../bukkit/Data/EntityTypeList";

const bukkitOptions = ENTITY_TYPE_LIST.map(e => {
    return {
        label: e.getBukkitId(), // TODO: i18n
        value: e.getBukkitId()
    } as {
        label: string;
        value: string;
    } & DefaultOptionType;
});


/**
 * Input for EntityType List with Amount.
 * 
 * - `value` - string[]. Bukkit's EntityTypes
 * - `defaultValue` -[EntityType, Amount][]]. Bukkit's EntityTypes with amount
 * - `placeholder` - string. Placeholder when nothing is selected
 * - `config`:
 *   - `min` - Minimum allowed value. Default to 1.
 *   - `max` - Maximum allowed value.
 *   - `step` - Increment step value. Default to 1.
 *   - `allowEmpty` - Boolean, allow remove all entries / no default value.
 * @param props 
 * @returns 
 */
export default function (props: InputProps) {
    const [valueArray, setValueArray] = useState<[string, number | undefined][]>([]);
    useEffect(() => {
        setValueArray(props.value as [string, number][] || props.defaultValue);
        updateDisabled((props.value as [string, number][])?.map(e => e[0]));
    }, [props.value]);

    const [options, setOptions] = useState(bukkitOptions);

    const [focusIndex, setFocusIndex] = useState<number>(-1);

    // Disable selected options from the available list
    const updateDisabled = (valueUpdate: string[]) => {
        setOptions(bukkitOptions.map(option => {
            if (valueUpdate.some(v => v.toUpperCase() === option.value)) {
                option.disabled = true;
            } else {
                option.disabled = undefined;
            }
            return option;
        }));
    };

    const onChange = (value: string, index: number) => {
        // Update value
        const valueUpdate = valueArray.slice();
        valueUpdate[index][0] = value;
        // setValueArray(valueUpdate);
        props.onChange(valueUpdate);

        // Disable selected options from the available list
        updateDisabled(valueUpdate.map(e => e[0]));
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
        updateDisabled(valueUpdate.map(e => e[0]));
    };

    const onAdd = () => {
        const valueUpdate = valueArray.slice();

        // Do not allow adding new empty value if there is already one
        if (valueUpdate.length > 0 && valueUpdate.some(v => v[0].length === 0)) {
            setFocusIndex(valueUpdate.findIndex(v => v[0].length === 0));
            return;
        }

        // Update value
        valueUpdate.push(['', undefined]);
        setFocusIndex(valueUpdate.length - 1);
        setValueArray(valueUpdate);
        props.onChange(valueUpdate);

        // Disable selected options from the available list
        updateDisabled(valueUpdate.map(e => e[0]));
    };

    return (
        <Space
            direction="vertical"
            size={4}
            style={{ width: '-webkit-fill-available' }}
        >
            {valueArray.map(([entityType, amount], index) =>
                <Space.Compact
                    block
                    key={index}
                    style={{ width: '-webkit-fill-available' }}
                >
                    <Select
                        value={entityType.toUpperCase()}
                        defaultActiveFirstOption={false}
                        onChange={e => onChange(e, index)}
                        options={options}
                        showSearch
                        onSearch={onSearch}
                        filterOption={onFilterOption}
                        notFoundContent={null}
                        popupMatchSelectWidth={false}
                        placeholder={props.placeholder ? (props.placeholder as string[])[0] : ''}
                        autoFocus={index === focusIndex}
                        open={index === focusIndex}
                        onFocus={() => setFocusIndex(index)}
                        onBlur={() => setFocusIndex(-1)}
                        onSelect={() => setFocusIndex(-1)}
                        size="small"
                        style={{ width: '100%' }}
                    />
                    <Tooltip title={L("betonquest.*.input.entity*.amountTooltip", ["1"])}>
                        <InputNumber
                            value={amount}
                            onChange={v => {
                                const newEntityTypeList = valueArray.map((entityType, i) => {
                                    if (i === index) {
                                        let amt = v;
                                        if (v === null) {
                                            amt = undefined;
                                        }
                                        entityType[1] = amt;
                                        return entityType;
                                    }
                                    return entityType;
                                });
                                props.onChange(newEntityTypeList);
                                setValueArray(newEntityTypeList);
                            }}
                            placeholder={props.placeholder ? (props.placeholder as string[])[1] : undefined}
                            min={props.config?.min | 1}
                            max={props.config?.max}
                            step={props.config?.step}
                            size="small"
                        />
                    </Tooltip>
                    {(props.config?.allowEmpty || valueArray.length > 1) && <Button
                        style={{ height: 'inherit', background: 'none' }}
                        type="default"
                        size="small"
                        onClick={() => onRemove(index)}
                    >
                        <VscClose style={{ verticalAlign: 'middle' }} />
                    </Button>}
                </Space.Compact>
            )}
            <Button
                type="primary"
                size="small"
                onClick={onAdd}
            >
                {L("betonquest.*.input.entity*.add")}
            </Button>
        </Space>
    );
}