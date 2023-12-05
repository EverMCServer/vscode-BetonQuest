import * as React from "react";
import { YAMLError } from "yaml";
import { WebviewApi } from "vscode-webview";
import { Button } from "antd";

import '../style/vscodeButton.css';

interface YamlErrorProps {
    yamlErrors: YAMLError[],
    vscode: WebviewApi<unknown>,
}

export default function yamlErrorPage(props: YamlErrorProps) {
    return (
        <div
            style={{
                height: "100vh",
                overflow: "auto",
                display: "grid",
                alignItems: "center", // y
                justifyContent: "center", // x
                padding: "12px"
            }}
        >
            <div>
                <div>
                    <div
                        style={{
                            fontSize: "large",
                            color: "var(--vscode-list-errorForeground)",
                        }}
                    >There are error(s) on the YAML.</div>
                    <div>Please fix them before continue:</div>
                </div>{props.yamlErrors.map((e, i) => {
                    return (
                        <Button
                            key={i}
                            type="default"
                            style={{
                                margin: "12px 0",
                            }}
                        >
                            <div
                                style={{
                                    whiteSpace: "pre-wrap",
                                    textAlign: "left"
                                }}
                                onClick={() => {
                                    props.vscode.postMessage({
                                        type: "cursor-postion",
                                        content: e.pos[0],
                                        activateDocuemnt: true,
                                    });
                                }}
                            >#{i + 1 + ": " + e.message}</div>
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}