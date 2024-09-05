import { Button, Space } from "antd";
import { useEffect, useState } from "react";

import { VscClose } from "react-icons/vsc";
import L from "../../i18n/i18n";
import { InputProps } from "./Common";
import Number from "./Number";

/**
 * Input for Number List.
 * 
 * - `value` - String value
 * - `config`:
 *   - `defaultValue` - Arrays. Default locations when `value` is undefined. e.g. [[0.5, 64, 0.5, "world", 0, 0]]
 *   - `optional` - Boolean. If true, will have a checkbox to toggle optional. `value` is undefined when toggled false.
 * @param props 
 * @returns 
 */
export default function (props: InputProps) {
    const [valueArray, setValueArray] = useState<number[]>([]);
    useEffect(() => {
        setValueArray(props.value as number[] || props.defaultValue || [0]);
    }, [props.value]);

    const onChange = (value: number, index: number) => {
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

        // Update value
        valueUpdate.push(0);
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
                    <Number
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