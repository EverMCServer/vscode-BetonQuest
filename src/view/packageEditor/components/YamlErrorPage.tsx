import * as React from "react";
import { YAMLError } from "yaml";

import { vscode } from "../vscode";

interface YamlErrorProps {
    yamlErrors: YAMLError[],
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
                    >You have error(s) on your YAML.</div>
                    <div>Please fix them before continue:</div>
                </div>
                <div
                    style={{
                        whiteSpace: "pre-wrap",
                    }}
                >{props.yamlErrors.map((e, i) => {
                    return (
                        <div
                            className="vscode-button vscode-button-secondary"
                            key={i}
                            style={{
                                margin: "12px 0"
                            }}
                        >
                            <div
                                style={{
                                    textAlign: "left"
                                }}
                                onClick={() => {
                                    vscode.postMessage({
                                        type: "cursor-postion",
                                        content: e.pos[0],
                                        activateDocuemnt: true,
                                    });
                                }}
                            >#{i + 1 + ": " + e.message}</div>
                        </div>
                    );
                })}</div>
            </div>
        </div>
    );
}