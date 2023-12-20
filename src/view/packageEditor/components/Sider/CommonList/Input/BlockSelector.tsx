import React, { useCallback, useEffect, useState } from "react";
import { Button, Divider, Input, Select, Space } from "antd";
import { compile as compileJavaRegex } from "java-regex-js";

import { InputProps } from "./Common";
import MATERIAL_LIST from "../../../../../../bukkit/Data/MaterialList";
import { VscClose, VscTrash } from "react-icons/vsc";

const bukkitOptions = MATERIAL_LIST.filter(e => e.isBlock()).map(e => {
    return {
        value: e.getBukkitId(),
        label: e.getBukkitId() // TODO: i18n
    };
});

// https://docs.betonquest.org/2.0-DEV/Documentation/Scripting/Data-Formats/#block-selectors

export default function (props: InputProps) {
    const [options, setOptions] = useState(bukkitOptions);

    const [namespace, setNamespace] = useState<string>("");
    const [tag, setTag] = useState<string>("");
    const [blockId, setBlockId] = useState<string>("");
    const [state, setState] = useState<[string, string][]>([]);
    useEffect(() => {
        if (!props.value) {
            setNamespace("");
            setTag("");
            setBlockId("");
            setState([]);
            return;
        }

        // Seprate components by colon
        const pattern1 = /^(?:(.*?)(?<!\{[^\}]*|\(\?|\\):(?![^\{]*\}))?(?:(.*?)(?<!\{[^\}]*|\(\?|\\):(?![^\{]*\}))?(.+)$/mi;
        let [_, mNamespace, mTag, mBlockId] = pattern1.exec(props.value) ?? [];
        setNamespace(mNamespace || "");
        setTag(mTag || "");

        // Seprate state, if any
        let mStateStr = "";
        if (mBlockId.endsWith(']')) {
            const pattern2 = /^(.+)\[(.*)\]$/mi;
            [_, mBlockId, mStateStr] = pattern2.exec(mBlockId) ?? [, mBlockId, ""];
        }
        setBlockId(mBlockId || "");

        if (mStateStr) {
            const state: [string, string][] = [];
            const pairs = mStateStr.split(",");
            for (const pair of pairs) {
                const [key, value] = pair.split("=");
                state.push([key, value]);
            }
            setState(state);
        } else {
            setState([]);
        }
    }, [props.value]);

    const setValue = useCallback((namespace: string, tag: string, blockId: string, state: [string, string][]) => {
        let value = "";
        if (namespace) {
            value = namespace + ":";
        }
        if (tag) {
            if (value === "") {
                value += ":";
            }
            value += tag + ":";
        }
        if (blockId) {
            value += blockId;
        }
        if (state.length > 0) {
            value += "[";
            value += state.map(e => e.join("=")).join(",");
            value += "]";
        }
        props.onChange(value);
    }, [props.onChange]);

    return (
        <>
            <span>Namespace:</span>
            <Input
                value={namespace}
                defaultValue={"minecraft"}
                placeholder="minecraft"
                onChange={(e) => {
                    // Filter illigal characters
                    if (e.target.value.match(/[^a-z0-9_\[\]\{\}\(\)\<\>\?\:\=\!\.\*\+\^\$\\,]/i)) {
                        return;
                    }
                    // Update namespace
                    setNamespace(e.target.value);
                    setValue(e.target.value, tag, blockId, state);
                }}
                size="small"
            />
            <Divider />
            <span>Tag:</span>
            <Input
                value={tag}
                defaultValue={""}
                placeholder=""
                onChange={(e) => {
                    // Filter illigal characters
                    if (e.target.value.match(/[^a-z0-9_\/\[\]\{\}\(\)\<\>\?\:\=\!\.\*\+\^\$\\,]/i)) {
                        return;
                    }
                    // Update tag
                    setTag(e.target.value);
                    setValue(namespace, e.target.value, blockId, state);
                }}
                size="small"
            />
            <Divider />
            <span>Block:</span>
            <Select
                value={blockId}
                // defaultValue={props.value}
                defaultActiveFirstOption={false}
                // onSelect={(e) => {
                //     props.onChange(e);
                // }}
                onChange={(e) => {
                    setBlockId(e);
                    setValue(namespace, tag, e, state);
                }}
                options={options}
                showSearch
                onSearch={searchString => {
                    if (
                        searchString.length > 0
                        // Allow normal EntityType syntax, or RegExp
                        && searchString.match(/^[a-z0-9_\[\]\{\}\(\)\<\>\?\:\=\!\.\*\+\^\$\\,]+$/mi)
                        && !bukkitOptions.some(e => e.label === searchString.toUpperCase())
                    ) {
                        try {
                            // new RegExp(searchString, 'mi');
                            compileJavaRegex(searchString); // test if it could build Java's RegExp
                            setOptions([{ value: searchString, label: searchString }, ...bukkitOptions]);
                        } catch (e: any) {
                            console.log("bad regex:", e.message);
                            setOptions(bukkitOptions);
                        }
                    } else {
                        setOptions(bukkitOptions);
                    }
                }}
                filterOption={(input, option) => {
                    try {
                        // compileJavaRegex(input);
                        // const regexp = new RegExp(input, 'mi');
                        // return option?.label ? regexp.test(option.value) || regexp.test(option.label) || option.value === input : false;
                        const regexp = compileJavaRegex(input);
                        // const regexp = compileJavaRegex(`.*?${input}.*`, CASE_INSENSITIVE);
                        return option?.label ? regexp(option.value) || regexp(option.label) || option.value.includes(input.toUpperCase()) || option.value === input : false;
                    } catch {
                        return false;
                    }
                }}
                notFoundContent={null}
                popupMatchSelectWidth={false}
                placeholder={props.placeholder}
                size="small"
                style={{ width: '100%' }}
            />
            <Divider />
            <div>State:</div>
            {/* <Space direction="vertical"> */}
            {state.map(([key, value], index) =>
                <Space.Compact block key={index} style={{ width: '100%' }}>
                    <Input
                        value={key}
                        defaultValue={""}
                        onChange={(e) => {
                            // Filter illigal characters
                            if (e.target.value.match(/[^a-z0-9_\[\]\{\}\(\)\<\>\?\:\=\!\.\*\+\^\$\\,]/i)) {
                                return;
                            }
                            // Update key
                            const newState = [...state];
                            newState[index][0] = e.target.value;
                            setState(newState);
                            setValue(namespace, tag, blockId, newState);
                        }}
                        size="small"
                    />
                    <Input
                        // className="site-input-split"
                        style={{
                            width: 30,
                            borderLeft: 0,
                            borderRight: 0,
                            pointerEvents: 'none',
                        }}
                        placeholder="="
                        disabled
                        size="small"
                    />
                    <Input
                        value={value}
                        defaultValue={""}
                        onChange={(e) => {
                            // Filter illigal characters
                            if (e.target.value.match(/[^a-z0-9_\[\]\{\}\(\)\<\>\?\:\=\!\.\*\+\^\$\\,]/i)) {
                                return;
                            }
                            // Update value
                            const newState = [...state];
                            newState[index][1] = e.target.value;
                            setState(newState);
                            setValue(namespace, tag, blockId, newState);
                        }}
                        size="small"
                    />
                    <Button
                        onClick={() => {
                            // Remove state
                            const newState = [...state.slice(0, index), ...state.slice(index + 1)];
                            setState(newState);
                            setValue(namespace, tag, blockId, newState);
                        }}
                        style={{
                            marginLeft: 1,
                            padding: 0
                        }}
                        type="default"
                        size="small"
                        title="Remove"
                    >
                        <VscClose
                            style={{
                                verticalAlign: "middle",
                                textAlign: "center"
                            }}
                        />
                    </Button>
                </Space.Compact>
            )}
            {/* </Space> */}
            <div>
                <Button
                    type="primary"
                    size="small"
                    onClick={() => {
                        const newState = [...state];
                        newState.push(["", ""]);
                        setState(newState);
                        setValue(namespace, tag, blockId, newState);
                    }}
                >
                    Add
                </Button>
            </div>
        </>
    );
}