import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Checkbox, Input, InputNumber, Select, Space, Tooltip } from "antd";

import L from "../../i18n/i18n";
import { InputProps } from "./Common";
import { VscClose } from "react-icons/vsc";
import BaseLocation from "./BaseLocation";

// https://docs.betonquest.org/2.0-DEV/Documentation/Scripting/Data-Formats/#block-selectors

type BaseLocationType = [defaultX: number, defaultY: number, defaultZ: number, defaultWorld: string, defaultYaw?: number, defaultPitch?: number];

/**
 * Input for Location List.
 * 
 * - `value` - String value
 * - `config`:
 *   - `defaultValue` - Arrays. Default locations when `value` is undefined. e.g. [[0.5, 64, 0.5, "world", 0, 0]]
 *   - `optional` - Boolean. If true, will have a checkbox to toggle optional. `value` is undefined when toggled false.
 * @param props 
 * @returns 
 */
export default function (props: InputProps) {
    const [valueArray, setValueArray] = useState<string[]>([]);
    useEffect(() => {
        setValueArray(props.value as string[] || props.defaultValue || ["0.5;64;0.5;world"]);
    }, [props.value]);

    const onChange = (value: string, index: number) => {
        // Update value
        const valueUpdate = valueArray.slice();
        valueUpdate[index] = value;
        // setValueArray(valueUpdate);
        props.onChange(valueUpdate);
    };

    const onRemove = (index: number) => {
        // Update value
        const valueUpdate = [...valueArray.slice(0, index), ...valueArray.slice(index + 1)];
        setValueArray(valueUpdate);
        props.onChange(valueUpdate);
    };

    const onAdd = () => {
        const valueUpdate = valueArray.slice();

        // Do not allow adding new empty value if there is already one
        if (valueUpdate.length > 0 && valueUpdate.some(v => v[0].length === 0)) {
            return;
        }

        // Update value
        valueUpdate.push('');
        setValueArray(valueUpdate);
        props.onChange(valueUpdate);
    };

    return (
        <Space
            direction="vertical"
            size={8}
            style={{ width: '-webkit-fill-available' }}
        >
            {valueArray.map((location, index) =>
                <Space.Compact
                    block
                    key={index}
                    style={{ width: '-webkit-fill-available' }}
                >
                    <BaseLocation
                        value={location}
                        defaultValue={props.defaultValue[0]}
                        placeholder={props.placeholder}
                        onChange={e => onChange(e, index)}
                        config={props.config}
                    />
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
                {L("betonquest.*.input.enchantment*.add")}
            </Button>
        </Space>
    );
}