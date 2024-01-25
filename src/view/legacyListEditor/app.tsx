import * as React from "react";
import { useEffect, useState } from "react";
import { ConfigProvider } from "antd";
import { YAMLError } from "yaml";
import { vscode } from "./vscode";

import List from "../../betonquest/List";
import ListElement from "../../betonquest/ListElement";
import CommonList, { ListEditorProps } from "./components/CommonList";
import { YamlPathPointer } from "../../utils/yamlPathPointer";

import '../style/vscodeButton.css';
import '../style/vscodeCheckbox.css';
import "../style/vscodeDivider.css";
import "../style/vscodeInputNumber.css";
import "../style/vscodePopover.css";
import "../style/vscodeTooltip.css";

// Global variables from vscode
declare global {
    namespace legacyListEditor {
        var initialConfig: any;
    }
}

// Cache of the YAML
let cachedYaml = "";

// Handler for delayed YAML update
let syncYamlTimeoutHandler: number;

export default function app<T extends ListElement>(props: ListEditorProps<T>) {

    // Get initial content data from vscode
    const [list, _setList] = useState(new List<T>(cachedYaml));
    const [yamlErrors, setYamlErrors] = useState<YAMLError[]>();

    // Width of the sider
    const [siderWidth, setSiderWidth] = useState(document.body.scrollWidth / 3);

    // Prevent unnecessary rendering
    const setList = (newList: List<T>) => {
        const newYaml = newList.getYamlText();
        if (newYaml !== cachedYaml) {
            _setList(newList);
            cachedYaml = newYaml;
        }
    };

    // Get document's content update from vscode
    useEffect(() => {
        // Notify vscode when webview startup completed.
        vscode.postMessage({
            type: "webview-lifecycle",
            content: "started",
        });
        // Listen from extension message (document update etc)
        window.addEventListener('message', event => {
            const message = event.data; // JSON

            switch (message.type) {
                case 'update':
                    // Update Package
                    const p = new List<T>(message.content);
                    // Check if parse error
                    const e = p.getYamlErrors();
                    if (e.length) {
                        setYamlErrors(e);
                        break;
                    }
                    setYamlErrors(undefined);
                    // Update Package
                    setList(p);
                    // Handle for initial document update
                    if (message.isInit) {
                        //
                    }
                    break;
                case "cursor-yaml-path":
                    setEditorPathPointer(message.content);
                    break;
                case 'betonquest-translationSelection':
                // setTranslationSelection(message.content);
            }
        });
    }, []);

    // Sync package's YAML back to VSCode, delay in ms
    const syncYaml = (delay: number = 1000) => {
        // Prevent YAML update if it is still updating.
        window.clearTimeout(syncYamlTimeoutHandler);

        // Delayed YAML update.
        syncYamlTimeoutHandler = window.setTimeout(() => {
            // Update
            cachedYaml = list.getYamlText(); // Prevent duplicated update
            vscode.postMessage({
                type: "edit",
                content: cachedYaml,
            });
        }, delay);
    };

    // Yaml's path pointer cache, to sync between components
    const [documentPathPointer, setDocumentPathPointer] = useState<string[]>([]); // -> * document *
    const [editorPathPointer, setEditorPathPointer] = useState<string[]>([]); // -> * editor *
    useEffect(() => {
        // Move the cursor on the YAML document
        if (list.hasPath(documentPathPointer)) {
            vscode.postMessage({
                type: "cursor-yaml-path",
                content: documentPathPointer,
            });
        }
    }, [documentPathPointer]);

    return (
        <YamlPathPointer.Provider value={{
            documentPathPointer: documentPathPointer,
            setDocumentPathPointer: setDocumentPathPointer,
            editorPathPointer: editorPathPointer,
            setEditorPathPointer: setEditorPathPointer,
        }}>
            <ConfigProvider
                theme={{
                    components: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        Collapse: {
                            headerBg: 'var(--vscode-sideBarSectionHeader-background)',
                            contentBg: 'var(--vscode-sideBar-dropBackground)',
                            headerPadding: 2,
                            contentPadding: 0,
                            borderRadiusLG: 0,

                            // global
                            colorBorder: 'var(--vscode-sideBarSectionHeader-border)',
                            lineWidth: 1, // border line width
                            colorText: '', // content default color of text
                            colorTextHeading: 'var(--vscode-sideBarTitle-foreground)', // heading color of text
                            marginSM: 12, // left margin of header text
                        },
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        Select: {
                            // selectorBg: 'var(--vscode-input-background)', // = colorBgContainer
                            // optionSelectedBg: 'var(--vscode-list-activeSelectionBackground)', // = controlItemBgActive
                            optionSelectedColor: 'var(--vscode-list-activeSelectionForeground)', // text color of selected item
                            // optionActiveBg: 'var(--vscode-list-hoverBackground)', // = controlItemBgHover
                            multipleItemBg: 'var(--vscode-badge-background)', // multiple selected item's background

                            // global
                            colorBgContainer: 'var(--vscode-input-background)', // background color of input box
                            colorBgContainerDisabled: 'var(--vscode-input-background)', // background color of input box when disabled
                            colorBgElevated: 'var(--vscode-input-background)', // background color of drop-down box
                            controlItemBgActive: 'var(--vscode-list-activeSelectionBackground)', // background color of active item = optionSelectedBg
                            controlItemBgHover: 'var(--vscode-list-hoverBackground)', // background color of hover item
                            colorText: 'var(--vscode-input-foreground)',
                            colorTextPlaceholder: 'var(--vscode-input-placeholderForeground)',
                            colorTextQuaternary: 'var(--vscode-input-placeholderForeground)', // suffix icon "down arrow" color
                            colorIcon: 'var(--vscode-input-placeholderForeground)', // "clear" button color
                            colorIconHover: 'var(--vscode-list-hoverForeground)', // "clear" button color when hover
                            colorBorder: 'var(--vscode-checkbox-border)', // border color
                            colorPrimary: 'var(--vscode-focusBorder)', // active / focus border color
                            colorPrimaryHover: 'var(--vscode-input-foreground)', // hover color border
                            borderRadius: 0,
                            borderRadiusLG: 0,
                            borderRadiusSM: 0,
                            borderRadiusXS: 0,
                        },
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        Input: {
                            activeBorderColor: 'var(--vscode-focusBorder)',
                            hoverBorderColor: 'var(--vscode-input-foreground)',

                            // global
                            colorText: 'var(--vscode-input-foreground)',
                            colorTextPlaceholder: 'var(--vscode-input-placeholderForeground)',
                            colorTextQuaternary: 'var(--vscode-input-placeholderForeground)', // suffix icon color
                            colorTextTertiary: 'var(--vscode-input-foreground)', // suffix icon color when hover
                            colorBgContainer: 'var(--vscode-input-background)',
                            colorBorder: 'var(--vscode-checkbox-border)',
                            borderRadius: 0,
                            borderRadiusLG: 0,
                            borderRadiusSM: 0,
                        },
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        Button: {
                            // See "style/vscodeButton.css"

                            // defaultColor: 'var(--vscode-button-foreground)', // text color of button
                            // defaultBg: 'var(--vscode-button-secondaryBackground)', // background color of button, secondary / default
                            // // ?: 'var(--vscode-button-secondaryHoverBackground)', // background color of button when hover, secondary / default
                            // defaultBorderColor: '', // border color, secondary / default
                            // colorPrimaryHover: '', // background color of primary button when hover, secondary / default button border+text color when hover

                            // // global
                            // lineWidth: 0, // all button border line width

                            // colorPrimary: 'var(--vscode-button-background)', // background color of button, primary
                            // colorPrimaryActive: 'var(--vscode-button-hoverBackground)', // text color of button when clicked, primary
                            // // colorPrimaryHover: 'var(--vscode-button-hoverBackground)', // background color of button when hover, primary
                            // // controlOutline: '', // primay button shadow
                            // primaryShadow: '', // primay button shadow

                            // // controlTmpOutline: '', // secondary / default button shadow
                            // defaultShadow: '', // secondary / default button shadow

                            // borderRadius: 2,
                            // borderRadiusLG: 2,
                            // borderRadiusSM: 2,

                            // colorPrimaryBorder: 'var(--vscode-focusBorder)', // focus outline border color
                            // lineWidthFocus: 1, // focus outline border width
                            // // ?: 10, // focus outline border offset
                        },
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        Popover: {
                            // See "style/vscodePopover.css"
                        },
                    },
                }}
            >
                <CommonList<T> {...props} list={list} syncYaml={syncYaml} />
            </ConfigProvider>
        </YamlPathPointer.Provider>
    );
}
