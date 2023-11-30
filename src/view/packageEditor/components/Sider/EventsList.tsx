import React, { useEffect, useState } from "react";

import Package from "../../../../betonquest/Package";
import { Button, Collapse, CollapseProps, ConfigProvider, Input } from "antd";
import EventsEditor from "./EventsList/EventsEditor";

interface EventsListProps {
    package: Package,
    syncYaml: Function,
}

export default function eventsList(props: EventsListProps) {

    // Convert all Events into coresponding Event's Editor
    const getEventEditors = (pkg: Package): CollapseProps['items'] => {
        return pkg.getAllEvents().map((e, i) => {
            return {
                key: i,
                label: e.getName(),
                children: <EventsEditor key={e.getName()} package={props.package} syncYaml={props.syncYaml} event={e}></EventsEditor>,
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