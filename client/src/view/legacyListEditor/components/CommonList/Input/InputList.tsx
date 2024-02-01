import React, { useEffect, useState } from "react";
import { Input, Tooltip } from "antd";
import { VscClose } from "react-icons/vsc";

import L from "../../../../../i18n/i18n";
import { InputProps } from "./Common";

/**
 * Input for list of text.
 * 
 * - `value` - string[]. Array of string.
 * - `defaultValue` - string[]. default values
 * - `placeholder` - single enchantment + level, [[Enchantment, level]
 * - `config`:
 *   - `allowedPatterns` - RegExp. Check input against the pattern.
 * @param props 
 * @returns 
 */
export default function (props: InputProps) {
    // UI update trigger
    const [getTrigger, setTrigger] = useState(false);
    const refreshUI = () => {
        setTrigger(!getTrigger);
    };

    const [valueArray, setValueArray] = useState(props.value as string[] || props.config?.defaultValue || [""]);
    useEffect(() => {
        setValueArray(props.value as string[] || props.config?.defaultValue || [""]);
    }, [props.value]);

    const [focusIndex, setFocusIndex] = useState<number>();

    return (
        <>
            {valueArray.map((value, index) => <Tooltip title={L("betonquest.*.input.inputList.tooltip")} key={index}>
                <Input
                    value={value || ""}
                    onChange={(e) => {
                        // Filter out unwanted input
                        if (
                            props.config?.allowedPatterns &&
                            !(props.config.allowedPatterns as (string | RegExp)[])
                                .some(element =>
                                    (new RegExp(element)).test(e.target.value)
                                )
                        ) {
                            return;
                        }

                        // Update value
                        const valueUpdate = valueArray;
                        valueUpdate[index] = e.target.value;
                        setValueArray(valueUpdate);
                        props.onChange(valueUpdate);
                        refreshUI();
                    }}
                    placeholder={props.placeholder}
                    autoFocus={index === focusIndex}
                    onPressEnter={() => {
                        const valueUpdate = [...valueArray.slice(0, index + 1), "", ...valueArray.slice(index + 1)];
                        setValueArray(valueUpdate);
                        setFocusIndex(index + 1);
                        props.onChange(valueUpdate);
                        refreshUI();
                    }}
                    size="small"
                    style={index > 0 ? { marginTop: 4 } : undefined}
                    suffix={
                        valueArray.length > 1 ? <Tooltip title={L("remove")}>
                            <VscClose
                                onClick={() => {
                                    const valueUpdate = [...valueArray.slice(0, index), ...valueArray.slice(index + 1)];
                                    setValueArray(valueUpdate);
                                    setFocusIndex(index);
                                    props.onChange(valueUpdate);
                                    refreshUI();
                                }}
                            /></Tooltip> : undefined
                    }
                />
            </Tooltip>)}
        </>
    );
}