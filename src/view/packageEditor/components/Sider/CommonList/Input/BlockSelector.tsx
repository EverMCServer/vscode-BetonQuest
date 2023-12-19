import React, { useCallback, useEffect, useState } from "react";
import { Button, Divider, Select } from "antd";
import { compile as compileJavaRegex } from "java-regex-js";

import { InputProps } from "./Common";
import MATERIAL_LIST from "../../../../../../bukkit/Data/MaterialList";
import Input from "./Input";

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
    const [state, setState] = useState<Map<string, string>>(new Map<string, string>());
    useEffect(() => {
        if (!props.value) {
            setNamespace("");
            setTag("");
            setBlockId("");
            setState(new Map<string, string>());
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
            const state = new Map<string, string>();
            const pairs = mStateStr.split(",");
            for (const pair of pairs) {
                const [key, value] = pair.split("=");
                state.set(key, value);
            }
            setState(state);
        } else {
            setState(new Map<string, string>());
        }
    }, [props.value]);

    const setValue = useCallback((namespace: string, tag: string, blockId: string, state: Map<string, string>) => {
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
        if (state.size > 0) {
            let pairs: string[] = [];
            state.forEach((value, key) => {
                pairs.push(key + "=" + value);
            });
            value += "[";
            value += pairs.join(",");
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
                    setNamespace(e);
                    setValue(e, tag, blockId, state);
                }}
            ></Input>
            <Divider />
            <span>Tag:</span>
            <Input
                value={tag}
                defaultValue={""}
                placeholder=""
                onChange={(e) => {
                    setTag(e);
                    setValue(namespace, e, blockId, state);
                }}
            ></Input>
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
                        && searchString.match(/^[a-z0-9_,\[\]\{\}\(\)\?\:\=\!\.\*\+\<\>\^\$\\]+$/mi)
                        && !bukkitOptions.some(e => e.label === searchString.toUpperCase())
                    ) {
                        try {
                            // new RegExp(searchString, 'mi');
                            compileJavaRegex(searchString); // test if it could build Java's RegExp
                            setOptions([{ value: searchString, label: searchString }, ...bukkitOptions]);
                        } catch (e) {
                            console.log("bad regex:", e);
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
            <span>State:</span>
            {state.size > 0 ?
                Array.from(state.entries()).map(([key, value]) =>
                    <div key={key}>
                        <Input
                            value={value}
                            defaultValue={""}
                            onChange={(e) => {
                                const newState = new Map(state);
                                newState.set(key, e);
                                setState(newState);
                                setValue(namespace, tag, blockId, newState);
                            }}
                        ></Input>
                        <Button
                            type="primary"
                            size="small"
                            onClick={() => {
                                const newState = new Map(state);
                                newState.delete(key);
                                setState(newState);
                                setValue(namespace, tag, blockId, newState);
                            }}
                        >
                            Remove
                        </Button>
                    </div>
                )
                :
                <></>
            }
            <Button
                type="primary"
                size="small"
                onClick={() => {
                    const newState = new Map(state);
                    newState.set("", "");
                    setState(newState);
                    setValue(namespace, tag, blockId, newState);
                }}
            >
                Add
            </Button>
            <div></div>
        </>
    );
}