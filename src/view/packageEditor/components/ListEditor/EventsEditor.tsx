import React, { useEffect, useState } from "react";

import Package from "../../../../betonquest/Package";
import Give from "./EventsEditor/Give";
import { Button, Collapse, CollapseProps, ConfigProvider, Input } from "antd";
import Default from "./EventsEditor/Default";

interface EventsEditorProps {
    package: Package,
    syncYaml: Function,
}

export default function eventsEditor(props: EventsEditorProps) {

    // Convert all Events into coresponding Event's Editor
    const getEventEditors = (pkg: Package): CollapseProps['items'] => {
        return pkg.getAllEvents().map((e, i) => {
            // Set default text editor for unknown kind.
            let editor: React.JSX.Element = <Default key={e.getName()} package={props.package} syncYaml={props.syncYaml} event={e}></Default>;

            // Get editor by kinds.
            switch (e.getKind().toLowerCase()) {
                case 'give':
                    editor = <Give key={e.getName()} package={props.package} syncYaml={props.syncYaml} event={e}></Give>;
                    break;
                default:
                    break;
            }
            return {
                key: i,
                label: e.getName(),
                children: editor,
                style: { margin: "8px 0" }
            };
        });
    };

    const [eventEditorList, setEventEditorList] = useState(getEventEditors(props.package));

    useEffect(() => {
        setEventEditorList(getEventEditors(props.package));
    }, [props.package]);

    return (
        <>
            <ConfigProvider
                theme={{
                    components: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        Input: {
                            activeBorderColor: 'var(--vscode-focusBorder)',
                            hoverBorderColor: '',

                            // global
                            colorText: 'var(--vscode-input-foreground)',
                            colorTextPlaceholder: 'var(--vscode-input-placeholderForeground)',
                            colorBgContainer: 'var(--vscode-input-background)',
                            colorBorder: '',
                            borderRadius: 0,
                            borderRadiusLG: 0,
                            borderRadiusSM: 0,
                        },

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
                    },
                }}
            >
                <Input
                    placeholder="Search"
                    size="small"
                    style={{
                        margin: "8px",
                        width: "-webkit-fill-available",
                    }}
                ></Input>
                <Collapse
                    // accordion
                    items={eventEditorList}
                    // ghost={true}
                    // bordered={false}
                    defaultActiveKey={[0, 1, 2]}
                    style={{
                        overflowY: "auto",
                        height: "inherit"
                    }}
                ></Collapse>
            </ConfigProvider>
        </>
    );
}