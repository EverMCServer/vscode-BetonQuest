import React, { useEffect, useRef, useState } from "react";
import { Col, Divider, Row, Tooltip } from "antd";
import { VscQuestion } from "react-icons/vsc";
import { TbVariableOff, TbVariablePlus } from "react-icons/tb";

import Event from "../../../../betonquest/Event";
import { MandatoryArgumentDataType, OptionalArgumentDataType } from "../../../../betonquest/Arguments";
import { ListElementEditorBodyProps } from "../../../legacyListEditor/components/CommonList/CommonEditor";
import Variable from "../../../legacyListEditor/components/CommonList/Input/Variable";

const colSpanLeft1 = 10;
const colSpanRight1 = 14;
const colSpanLeft2 = 8;
const colSpanRight2 = 16;
const colSpanLeft3 = 6;
const colSpanRight3 = 18;

export default function (props: ListElementEditorBodyProps<Event>) {

    // UI update trigger #1
    const [getTrigger, setTrigger] = useState(false);
    const refreshUI = () => {
        setTrigger(!getTrigger);
    };

    // UI update trigger #2
    // const [listElement, setListElement] = useState(props.listElement);
    // useEffect(()=>{
    //     setListElement(props.listElement);
    // }, [props.listElement]);

    // Arguments should be parsed everytime. Do NOT cache it.
    const args = props.listElement.getArguments(props.argumentsPattern);

    // Auto re-arange cells
    const parentRef = useRef<HTMLDivElement>(null);
    const [spanL, setSpanL] = useState(colSpanLeft1);
    const [spanR, setSpanR] = useState(colSpanRight1);
    useEffect(() => {
        new ResizeObserver(() => {
            const width = parentRef.current?.getBoundingClientRect().width;
            if (width) {
                if (width < 320) {
                    setSpanL(24);
                    setSpanR(24);
                } else if (width < 480) {
                    setSpanL(colSpanLeft1);
                    setSpanR(colSpanRight1);
                } else if (width < 640) {
                    setSpanL(colSpanLeft2);
                    setSpanR(colSpanRight2);
                } else {
                    setSpanL(colSpanLeft3);
                    setSpanR(colSpanRight3);
                }
            }
        }).observe(parentRef.current as Element);
    }, []);

    // Variable switching
    const variableEnabled = useRef<Map<number | string, boolean>>(new Map());
    useEffect(() => {
        const map = new Map<number | string, boolean>();
        for (let i = 0; i < props.argumentsPattern.mandatory.length; i++) {
            map.set(i, args.getMandatoryArgument(i).getType() === 'variable');
        }
        if (props.argumentsPattern.optional) {
            for (let i = 0; i < props.argumentsPattern.optional.length; i++) {
                const key = props.argumentsPattern.optional[i].key;
                map.set(key, args.getOptionalArgument(key)?.getType() === 'variable');
            }
        }
        variableEnabled.current = map;
    }, []);

    return (
        <div ref={parentRef}>
            {(props.argumentsPattern.mandatory.length > 0 && props.argumentsPattern.optional) &&
                <Divider orientation="center" plain>
                    <u>Mandatory Arguments</u>
                </Divider>
            }
            {props.argumentsPattern.mandatory.map((pat, index) => {
                const argValue = args.getMandatoryArgument(index).getValue();
                return (
                    <Row justify="space-between" gutter={[0, 4]} style={{ padding: "0 8px 16px 8px" }} key={index}>
                        <Col span={spanL}>
                            <div>
                                {pat.name}&nbsp;
                                {pat.tooltip && <>
                                    <sup>
                                        <Tooltip title={<span>{pat.tooltip}</span>}>
                                            <VscQuestion />
                                        </Tooltip>
                                    </sup>&nbsp;
                                </>}
                            </div>
                            {pat.allowVariable && <Tooltip title="Toggle Variable input" placement="bottom">
                                <span
                                    onClick={() => {
                                        if (variableEnabled.current.get(index)) {
                                            variableEnabled.current.set(index, false);
                                        } else {
                                            variableEnabled.current.set(index, true);
                                        }
                                        refreshUI();
                                    }}
                                    style={{ padding: 0, border: "1px solid var(--vscode-checkbox-border)" }}
                                >
                                    {variableEnabled.current.get(index) ? <TbVariableOff /> : <TbVariablePlus />}
                                </span>
                            </Tooltip>}
                        </Col>
                        <Col span={spanR}>
                            {pat.jsx && (pat.allowVariable && variableEnabled.current.get(index) &&
                                <Variable
                                    placeholder="(Variable)"
                                    value={argValue as string}
                                    onChange={(str) => {
                                        args.setMandatoryArgument(index, str);
                                        props.syncYaml();
                                        refreshUI(); // Refresh states, if component uses useEffect() inside
                                    }}
                                />
                                ||
                                <pat.jsx
                                    value={argValue}
                                    defaultValue={pat.defaultValue}
                                    placeholder={pat.placeholder}
                                    onChange={(value: MandatoryArgumentDataType) => {
                                        args.setMandatoryArgument(index, value);
                                        props.syncYaml();
                                        refreshUI(); // Refresh states, if component uses useEffect() inside
                                    }}
                                    config={pat.config}
                                />
                            )}
                        </Col>
                    </Row>
                );
            })}
            {props.argumentsPattern.optional &&
                <>
                    <Divider orientation="center" plain>
                        <u>Optional Arguments</u>
                    </Divider>
                    {props.argumentsPattern.optional?.map((pat, index) => {
                        const argValue = args.getOptionalArgument(pat.key)?.getValue();
                        return (
                            <Row justify="space-between" gutter={[0, 4]} style={{ padding: "0 8px 16px 8px" }} key={index}>
                                <Col span={spanL}>
                                    <div>{pat.name}&nbsp;
                                        {pat.tooltip && <>
                                            <sup>
                                                <Tooltip title={<span>{pat.tooltip}</span>}>
                                                    <VscQuestion />
                                                </Tooltip>
                                            </sup>&nbsp;
                                        </>}
                                    </div>
                                    {pat.allowVariable && <Tooltip title="Toggle Variable input" placement="bottom">
                                        <span
                                            onClick={() => {
                                                if (variableEnabled.current.get(pat.key)) {
                                                    variableEnabled.current.set(pat.key, false);
                                                } else {
                                                    variableEnabled.current.set(pat.key, true);
                                                }
                                                refreshUI();
                                            }}
                                            style={{ padding: 0, border: "1px solid var(--vscode-checkbox-border)" }}
                                        >
                                            {variableEnabled.current.get(pat.key) ? <TbVariableOff /> : <TbVariablePlus />}
                                        </span>
                                    </Tooltip>}
                                </Col>
                                <Col span={spanR}>
                                    {pat.jsx && (pat.allowVariable && variableEnabled.current.get(pat.key) &&
                                        <Variable
                                            placeholder="(Variable)"
                                            value={argValue as string}
                                            onChange={(str) => {
                                                args.setOptionalArgument(pat.key, str);
                                                props.syncYaml();
                                                refreshUI(); // Refresh states, if component uses useEffect() inside
                                            }}
                                        />
                                        ||
                                        <pat.jsx
                                            value={argValue}
                                            placeholder={pat.placeholder}
                                            onChange={(value: OptionalArgumentDataType) => {
                                                args.setOptionalArgument(pat.key, value);
                                                props.syncYaml();
                                                refreshUI(); // Refresh states, if component uses useEffect() inside
                                            }}
                                            config={pat.config}
                                        />
                                    )}
                                </Col>
                            </Row>
                        );
                    })}
                </>
            }
        </div>
    );
}