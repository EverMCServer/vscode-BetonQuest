import React, { useCallback, useEffect, useRef, useState } from "react";
import { Checkbox, Input, InputNumber, Space, Tooltip } from "antd";

import L from "betonquest-utils/i18n/i18n";
import { InputProps } from "./Common";

// https://docs.betonquest.org/2.0-DEV/Documentation/Scripting/Data-Formats/#block-selectors

/**
 * Input for Location.
 * 
 * - `value` - String value
 * - `config`:
 *   - `defaultValue` - Array. Default location when `value` is undefined. e.g. [0.5, 64, 0.5, "world", 0, 0]
 *   - `optional` - Boolean. If true, will have a checkbox to toggle optional. `value` is undefined when toggled false.
 * @param props 
 * @returns 
 */
export default function (props: InputProps) {
    const [defaultX, defaultY, defaultZ, defaultWorld, defaultYaw, defaultPitch] = props.config?.defaultValue || [0.5, 64, 0.5, "world", 0, 0];

    const [x, setX] = useState<number>(defaultX);
    const [y, setY] = useState<number>(defaultY);
    const [z, setZ] = useState<number>(defaultZ);
    const [world, setWorld] = useState<string>(defaultWorld);
    const [yaw, setYaw] = useState<number | null>(null);
    const [pitch, setPitch] = useState<number | null>(null);
    useEffect(() => {
        if (!props.value) {
            setX(defaultX);
            setY(defaultY);
            setZ(defaultZ);
            setWorld(defaultWorld);
            setYaw(null);
            setPitch(null);
            return;
        }

        // parse coordinate
        const [_, x, y, z, world, yaw, pitch] = /^([\+\-]?[0-9\.]+?);([\+\-]?[0-9\.]+?);([\+\-]?[0-9\.]+?);([a-z0-9_]+?)(?:;([\+\-]?[0-9\.]+?))?(?:;([\+\-]?[0-9\.]+?))?$/mi.exec(props.value as string) ?? [defaultX, defaultY, defaultZ, defaultWorld, undefined, undefined];
        if (x && y && z && world) {
            setX(parseFloat(x));
            setY(parseFloat(y));
            setZ(parseFloat(z));
            setWorld(world);
            setYaw(yaw ? parseFloat(yaw) : null);
            setPitch(pitch ? parseFloat(pitch) : null);
        }
    }, [props.value]);

    const setValue = useCallback((x: number, y: number, z: number, world: string, yaw: number | null, pitch: number | null) => {
        let value = `${x ?? defaultX};${y ?? defaultY};${z ?? defaultZ};${world || defaultWorld}`;
        if (yaw || pitch) {
            value += `;${yaw ?? defaultYaw};${pitch ?? defaultPitch}`;
            if (yaw === null) {
                setYaw(defaultYaw);
            }
            if (pitch === null) {
                setPitch(defaultPitch);
            }
        }

        props.onChange(value);
    }, [props.onChange]);

    // Cache value before toggled to false. So it can be resumed to the original value when toggled back.
    const cachedValueBeforeToggle = useRef(props.value);

    return (
        <Space direction="vertical" style={{ width: "100%" }}>
            {props.config?.optional ? <Space.Compact block><Checkbox
                checked={props.value ? true : false}
                onChange={e => {
                    if (e.target.checked) {
                        // setValue(x, y, z, world, yaw, pitch);
                        if (cachedValueBeforeToggle.current) {
                            props.onChange(cachedValueBeforeToggle.current);
                        } else {
                            setValue(defaultX, defaultY, defaultZ, defaultWorld, null, null);
                        }
                    } else {
                        cachedValueBeforeToggle.current = props.value;
                        props.onChange(undefined);
                    }
                }}
            /></Space.Compact> : undefined}
            {props.value !== undefined ? <><Space.Compact block>
                <Input
                    placeholder="* X"
                    style={{
                        width: "min-content",
                        borderRight: 0,
                        pointerEvents: 'none',
                    }}
                    disabled
                    size="small"
                />
                <InputNumber
                    value={x}
                    placeholder={`${defaultX}`}
                    onChange={e => {
                        setX(e || defaultX);
                        setValue(e || defaultX, y, z, world, yaw, pitch);
                    }}
                    size="small"
                    title="X"
                    style={{ width: "inherit" }}
                />
            </Space.Compact>
                <Space.Compact block>
                    <Input
                        placeholder="* Y"
                        style={{
                            width: "min-content",
                            borderRight: 0,
                            pointerEvents: 'none',
                        }}
                        disabled
                        size="small"
                    />
                    <InputNumber
                        value={y}
                        placeholder={`${defaultY}`}
                        onChange={e => {
                            setY(e || defaultY);
                            setValue(x, e || defaultY, z, world, yaw, pitch);
                        }}
                        size="small"
                        title="Y"
                        style={{ width: "inherit" }}
                    />
                </Space.Compact>
                <Space.Compact block>
                    <Input
                        placeholder="* Z"
                        style={{
                            width: "min-content",
                            borderRight: 0,
                            pointerEvents: 'none',
                        }}
                        disabled
                        size="small"
                    />
                    <InputNumber
                        value={z}
                        placeholder={`${defaultZ}`}
                        onChange={e => {
                            setZ(e || defaultZ);
                            setValue(x, y, e || defaultZ, world, yaw, pitch);
                        }}
                        size="small"
                        title="Z"
                        style={{ width: "inherit" }}
                    />
                </Space.Compact>
                <Space.Compact block>
                    <Input
                        placeholder={"* " + L("betonquest.*.input.baseLocation.world")}
                        style={{
                            width: "min-content",
                            borderRight: 0,
                            pointerEvents: 'none',
                        }}
                        disabled
                        size="small"
                    />
                    <Input
                        value={world}
                        placeholder="world"
                        onChange={e => {
                            setWorld(e.target.value);
                            setValue(x, y, z, e.target.value || defaultWorld, yaw, pitch);
                        }}
                        size="small"
                        title={L("betonquest.*.input.baseLocation.worldTooltip")}
                        style={{ width: "inherit" }}
                    />
                </Space.Compact>
                <Space.Compact block>
                    <Input
                        placeholder={L("betonquest.*.input.baseLocation.yaw")}
                        style={{
                            width: "min-content",
                            borderRight: 0,
                            pointerEvents: 'none',
                        }}
                        disabled
                        size="small"
                    />
                    <Tooltip
                        title={<div dangerouslySetInnerHTML={{ __html: L("betonquest.*.input.baseLocation.yawTooltip") }}></div>}
                    >
                        <InputNumber
                            value={yaw}
                            placeholder={L("(none)")}
                            onChange={e => {
                                setYaw(e);
                                setValue(x, y, z, world, e, pitch);
                            }}
                            size="small"
                            style={{ width: "inherit" }}
                        />
                    </Tooltip>
                </Space.Compact>
                <Space.Compact block>
                    <Input
                        placeholder={L("betonquest.*.input.baseLocation.pitch")}
                        style={{
                            width: "min-content",
                            borderRight: 0,
                            pointerEvents: 'none',
                        }}
                        disabled
                        size="small"
                    />
                    <Tooltip
                        title={<div dangerouslySetInnerHTML={{ __html: L("betonquest.*.input.baseLocation.pitchTooltip") }}></div>}
                    >
                        <InputNumber
                            value={pitch}
                            placeholder={L("(none)")}
                            min={-90}
                            max={90}
                            onChange={e => {
                                setPitch(e);
                                setValue(x, y, z, world, yaw, e);
                            }}
                            size="small"
                            style={{ width: "inherit" }}
                        />
                    </Tooltip>
                </Space.Compact>
            </> : undefined}
        </Space>
    );
}