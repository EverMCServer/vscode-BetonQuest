import React, { useEffect, useState } from "react";
import { Button, Input, InputNumber, Space, Tooltip } from "antd";
import { VscClose } from "react-icons/vsc";

import L from "../../../../../i18n/i18n";
import { InputProps } from "./Common";

/**
 * Input for Item List with Amount.
 * 
 * - `value` - [Item Name, amount][]: [string, number][]
 * - `defaultValue` - default values
 * - `placeholder` - single item + amount, [[item, amount]
 * - `config`:
 *   - `min` - Minimum allowed value.
 *   - `max` - Maximum allowed value.
 *   - `step` - Increment step value. Default to 1.
 *   - `allowEmpty` - Boolean, allow remove all entries / no default value.
 * @param props 
 * @returns 
 */
export default function (props: InputProps) {
    const [valueArray, setValueArray] = useState<[string, number | undefined][]>([]);
    useEffect(() => {
        if (props.value) {
            setValueArray(props.value as [string, number][]);
        } else {
            setValueArray(props.defaultValue || []);
        }
    }, [props.value]);

    const [focusIndex, setFocusIndex] = useState<number>();

    return (
        <Space
            direction="vertical"
            size={4}
            style={{ width: '-webkit-fill-available' }}
        >
            {valueArray.map(([item, amount], index) =>
                <Space.Compact
                    block
                    key={index}
                >
                    <Input
                        value={item}
                        onChange={(e) => {
                            // Check patterns
                            if (
                                /\s/.test(e.target.value)
                            ) {
                                return;
                            }

                            // Update item
                            const newItemList = valueArray.map((item, i) => {
                                if (i === index) {
                                    item[0] = e.target.value;
                                    return item;
                                }
                                return item;
                            });
                            props.onChange(newItemList);
                            setValueArray(newItemList);
                        }}
                        placeholder={props.placeholder ? (props.placeholder as string[])[0] : undefined}
                        autoFocus={index === focusIndex}
                        size="small"
                        style={{ width: 'inherit' }}
                    />
                    <Tooltip title={L("betonquest.*.input.item*.amountTooltip")}>
                        <InputNumber
                            value={amount}
                            onChange={v => {
                                const newItemList = valueArray.map((item, i) => {
                                    if (i === index) {
                                        let amt = v;
                                        if (v === null) {
                                            amt = undefined;
                                        }
                                        item[1] = amt;
                                        return item;
                                    }
                                    return item;
                                });
                                props.onChange(newItemList);
                                setValueArray(newItemList);
                            }}
                            placeholder={props.placeholder ? (props.placeholder as string[])[1] : undefined}
                            min={props.config?.min | 0}
                            max={props.config?.max}
                            step={props.config?.step}
                            size="small"
                        />
                    </Tooltip>
                    {(props.config?.allowEmpty || valueArray.length > 1) && <Button
                        style={{ height: 'inherit', background: 'none' }}
                        type="default"
                        size="small"
                        onClick={() => {
                            const valueUpdate = [...valueArray.slice(0, index), ...valueArray.slice(index + 1)];
                            setValueArray(valueUpdate);
                            props.onChange(valueUpdate);
                        }}
                    >
                        <VscClose style={{ verticalAlign: 'middle' }} />
                    </Button>}
                </Space.Compact>
            )}
            <div>
                <Button
                    type="primary"
                    size="small"
                    onClick={() => {
                        const valueUpdate = valueArray;
                        valueUpdate.push(["", undefined]);
                        setFocusIndex(valueArray.length - 1);
                        props.onChange(valueUpdate);
                    }}
                >
                    {L("betonquest.*.input.item*.add")}
                </Button>
            </div>
        </Space>
    );
}