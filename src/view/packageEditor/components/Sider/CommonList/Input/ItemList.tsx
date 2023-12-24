import React, { useEffect, useState } from "react";
import { Button, Input, InputNumber, Space } from "antd";
import { VscClose } from "react-icons/vsc";

import { InputProps } from "./Common";

export default function (props: InputProps) {
    const [valueArray, setValueArray] = useState<[string, number][]>([]);
    useEffect(() => {
        if (props.value) {
            setValueArray(props.value as [string, number][]);
        } else {
            setValueArray([]);
        }
    }, [props.value]);

    const [focusIndex, setFocusIndex] = useState<number>();

    return (
        <>
            {valueArray.map(([item, amount], index) =>
                <Space.Compact
                    block
                    key={index}
                    style={index > 0 ? { marginTop: 4 } : undefined}
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
                    {valueArray.length > 1 && <Button
                        style={{ height: 'inherit', marginLeft: 1 }}
                        type="default"
                        size="small"
                        onClick={() => {
                            const valueUpdate = [...valueArray.slice(0, index), ...valueArray.slice(index + 1)];
                            props.onChange(valueUpdate);
                        }}
                    >
                        <VscClose style={{ verticalAlign: 'middle' }} />
                    </Button>}
                </Space.Compact>
            )}
            <div style={{ marginTop: 4 }}>
                <Button
                    type="primary"
                    size="small"
                    onClick={() => {
                        const valueUpdate = valueArray;
                        valueUpdate.push(["", 0]);
                        setFocusIndex(valueArray.length - 1);
                        props.onChange(valueUpdate);
                    }}
                >
                    Add
                </Button>
            </div>
        </>
    );
}