import React, { useCallback, useEffect, useState } from "react";
import { Input, InputNumber, Space, Tooltip } from "antd";

import { InputProps } from "./Common";

// https://docs.betonquest.org/2.0-DEV/Documentation/Scripting/Data-Formats/#block-selectors

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

    return (
        <Space direction="vertical" style={{ width: "100%" }}>
            <Space.Compact block>
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
                    placeholder="* World"
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
                    title="Name of the world"
                    style={{ width: "inherit" }}
                />
            </Space.Compact>
            <Space.Compact block>
                <Input
                    placeholder="Yaw"
                    style={{
                        width: "min-content",
                        borderRight: 0,
                        pointerEvents: 'none',
                    }}
                    disabled
                    size="small"
                />
                <Tooltip
                    title={<div>
                        <div>-180.0: north</div>
                        <div>-90.0: east</div>
                        <div>0.0: south</div>
                        <div>90.0: west</div>
                    </div>}
                >
                    <InputNumber
                        value={yaw}
                        placeholder="(none)"
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
                    placeholder="Pitch"
                    style={{
                        width: "min-content",
                        borderRight: 0,
                        pointerEvents: 'none',
                    }}
                    disabled
                    size="small"
                />
                <Tooltip
                    title={<div>
                        <div>0.0: look horizontally</div>
                        <div>90.0: look straight down</div>
                        <div>-90.0: look straight up</div>
                    </div>}
                >
                    <InputNumber
                        value={pitch}
                        placeholder="(none)"
                        min={-90}
                        max={90}
                        onChange={e => {
                            setPitch(e);
                            setValue(x, y, z, world, yaw, e);
                        }}
                        size="small"
                        title="Pitch"
                        style={{ width: "inherit" }}
                    />
                </Tooltip>
            </Space.Compact>
        </Space>
    );
}