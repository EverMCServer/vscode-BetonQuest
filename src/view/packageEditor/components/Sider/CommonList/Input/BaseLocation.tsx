import React, { useCallback, useEffect, useState } from "react";
import { Input, InputNumber, Space } from "antd";

import { InputProps } from "./Common";

// https://docs.betonquest.org/2.0-DEV/Documentation/Scripting/Data-Formats/#block-selectors

export default function (props: InputProps) {
    const [defaultX, defaultY, defaultZ, defaultWorld, defaultPitch, defaultYaw] = props.config?.defaultValue || [0.5, 64, 0.5, "world", 90, 0];

    const [x, setX] = useState<number>(defaultX);
    const [y, setY] = useState<number>(defaultY);
    const [z, setZ] = useState<number>(defaultZ);
    const [world, setWorld] = useState<string>(defaultWorld);
    const [pitch, setPitch] = useState<number | null>(null);
    const [yaw, setYaw] = useState<number | null>(null);
    useEffect(() => {
        if (!props.value) {
            setX(defaultX);
            setY(defaultY);
            setZ(defaultZ);
            setWorld(defaultWorld);
            setPitch(null);
            setYaw(null);
            return;
        }

        // parse coordinate
        const [_, x, y, z, world, pitch, yaw] = /^([0-9\.]+?);([0-9\.]+?);([0-9\.]+?);([a-z0-9_]+?)(?:;([0-9\.]+?))?(?:;([0-9\.]+?))?$/mi.exec(props.value as string) ?? ["", "0.5", "64", "0.5", "world", undefined, undefined];
        if (x && y && z && world) {
            setX(parseFloat(x));
            setY(parseFloat(y));
            setZ(parseFloat(z));
            setWorld(world);
            setPitch(pitch ? parseFloat(pitch) : null);
            setYaw(yaw ? parseFloat(yaw) : null);
        }
    }, [props.value]);

    const setValue = useCallback((x: number, y: number, z: number, world: string, pitch: number | null, yaw: number | null) => {
        let value = `${x};${y};${z};${world}`;
        if (pitch || yaw) {
            value += `;${pitch||defaultPitch};${yaw||defaultYaw}`;
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
                        setValue(e || defaultX, y, z, world, pitch, yaw);
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
                        setValue(x, e || defaultY, z, world, pitch, yaw);
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
                        setValue(x, y, e || defaultZ, world, pitch, yaw);
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
                        setValue(x, y, z, e.target.value || defaultWorld, pitch, yaw);
                    }}
                    size="small"
                    title="Name of the world"
                    style={{ width: "inherit" }}
                />
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
                <InputNumber
                    value={pitch}
                    placeholder="(none)"
                    min={-90}
                    max={90}
                    onChange={e => {
                        setPitch(e);
                        setValue(x, y, z, world, e, yaw);
                    }}
                    size="small"
                    title="Pitch"
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
                <InputNumber
                    value={yaw}
                    placeholder="(none)"
                    min={-180}
                    max={180}
                    onChange={e => {
                        setYaw(e);
                        setValue(x, y, z, world, pitch, e);
                    }}
                    size="small"
                    title="Yaw"
                    style={{ width: "inherit" }}
                />
            </Space.Compact>
        </Space>
    );
}