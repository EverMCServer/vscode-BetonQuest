import React, { useCallback, useEffect, useState } from "react";
import { Divider, Select } from "antd";

import { InputProps } from "./Common";
import MATERIAL_LIST from "../../../../../../bukkit/Data/MaterialList";
import { compile as compileJavaRegex } from "java-regex-js";
import Input from "./Input";
import { set } from "yaml/dist/schema/yaml-1.1/set";

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

        const pattern1 = /^(?:(.*?)(?<!\{[^\}]*|\(\?|\\):(?![^\{]*\}))?(?:(.*?)(?<!\{[^\}]*|\(\?|\\):(?![^\{]*\}))?(.+)$/mi;
        const [_, mNamespace, mTag, mBlockId] = pattern1.exec(props.value) ?? [];
        setNamespace(mNamespace || "");
        setTag(mTag || "");
        setBlockId(mBlockId || "");
    }, [props.value]);

    const setValue = useCallback((namespace: string, tag: string, blockId: string) => {
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
                    setValue(e, tag, blockId);
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
                    setValue(namespace, e, blockId);
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
                    setValue(namespace, tag, e);
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
            <div></div>
        </>
    );
}