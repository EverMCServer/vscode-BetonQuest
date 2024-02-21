import React, { useEffect, useState } from "react";
import { Button, Input, Modal, Radio, Select, Space, Tabs } from "antd";
import type { Tab } from 'rc-tabs/lib/interface';
import { VscTrash } from "react-icons/vsc";

import L, { allLanguages } from "betonquest-utils/i18n/i18n";
import ConversationEditor from "./Main/ConversationEditor";
import ConversationTabLabel from "./Main/ConversationTabLabel";
import Package from "betonquest-utils/betonquest/Package";

import "./Main.css";

// Global variables from vscode
declare global {
    // Save current active tab key
    var activeTabKey: string;
}

interface MainProps {
    package: Package,
    syncYaml: (delay?: number) => void,
}

export default function main(props: MainProps) {

    const [activeTabKey, setActiveTabKey] = useState("");
    const [tabsItems, setTabsItems] = useState([] as Tab[]);
    const [modal, modalContextHolder] = Modal.useModal();

    // Function to remove a tab
    type TargetKey = React.MouseEvent | React.KeyboardEvent | string;
    const removeTab = (targetKey: TargetKey) => {

        // Iterate the tab objects, find the script key
        let lastIndex = -1;
        let newActiveKey = activeTabKey;
        tabsItems.find((v, i) => {
            if (v.key === targetKey) {
                props.package.removeConversation(targetKey);
                props.syncYaml();
                lastIndex = i - 1;
                return true;
            }
            return false;
        });

        // Reset the Tabs panes
        const newPanes = tabsItems.filter((item) => item.key !== targetKey);
        setTabsItems(newPanes);

        // Reset the active tabs
        if (newPanes.length && newActiveKey === targetKey) {
            if (lastIndex >= 0) {
                newActiveKey = newPanes[lastIndex].key;
            } else {
                newActiveKey = newPanes[0].key;
            }
        }
        setActiveTabKey(newActiveKey);
    };

    // Handle tabs switching
    const onTabsChange = (newActiveKey: string) => {
        setActiveTabKey(newActiveKey);
    };

    // Helper function to create new Conversation
    const newConversation = (key: string, isMultilingual: boolean, translationName: string = 'en') => {
        // Create new Conversation on package
        const conv = props.package.createConversation(key, key, isMultilingual, translationName);
        if (!conv) {
            return;
        }

        // Create new tab and update the view
        const newConvs = [...tabsItems];
        newConvs.push({
            key: key,
            label: <ConversationTabLabel label={key} package={props.package} syncYaml={props.syncYaml}></ConversationTabLabel>,
            children: <ConversationEditor key={key} conversation={conv} conversationName={key} syncYaml={props.syncYaml} translationSelection={translationName}></ConversationEditor>,
            closeIcon: <VscTrash />,
            style: { height: "100%" }  // Maximize tab content height for ReactFlow
        });
        setTabsItems(newConvs);
        setActiveTabKey(key);

        // Sync yaml back to VSCode
        props.syncYaml();

    };

    // Handle tabs addition / removal
    const onTabsEdit = (
        targetKey: TargetKey,
        action: `add` | 'remove',
    ) => {
        switch (action) {
            case 'add':
                onConversationCreate();
                break;

            case 'remove':
                // Prompt the confirmation modal
                modal.confirm({
                    title: L("packageEditor.main.deleteConfirm.title"),
                    content: L("packageEditor.main.deleteConfirm.content", [targetKey as string]),
                    okText: L("packageEditor.main.deleteConfirm.ok"),
                    okType: 'danger',
                    cancelText: L("cancel"),
                    onOk: () => {
                        // Remove the whole script from YAML
                        removeTab(targetKey);
                    }
                });

                break;
        }
    };

    // Persist config across modals
    // New key for Conversation's script name
    const [newConversationKeyConfig, setNewConversationKeyConfig] = useState("new_conv");
    // Multilingual selection
    const [isMultilingualConfig, setIsMultilingualConfig] = useState(true);
    const [translationNameConfig, setTranslationNameConfig] = useState(packageEditor.initialConfig.translationSelection || 'en');

    // Handle conversation creation
    const onConversationCreate = () => {
        // New key for Conversation's script name
        let key = newConversationKeyConfig;
        let count = 2;
        const allConv = props.package.getConversations();
        for (; allConv.has(key);) {
            key = `new_conv_${count++}`;
        };
        setNewConversationKeyConfig(key);

        // Multilingual selection
        let isMultilingual = isMultilingualConfig;
        let translationName = translationNameConfig;

        // Modal body for creating new Conversation
        // eslint-disable-next-line @typescript-eslint/naming-convention
        function ModalConversationCreate() {
            const [isMultilingualEnabled, setIsMultilingualEnabled] = useState(isMultilingual);

            return <Space>
                <Space.Compact direction="vertical" size="small">
                    <div>{L("packageEditor.main.createModal.name")}</div>
                    <div>{L("packageEditor.main.createModal.multilingual")}</div>
                    {isMultilingualEnabled ? <div>{L("packageEditor.main.createModal.language")}</div> : null}
                </Space.Compact>
                <Space.Compact direction="vertical" size="small">
                    <Input
                        size="small"
                        defaultValue={key}
                        onChange={e => { key = e.target.value; setNewConversationKeyConfig(e.target.value); }}
                    ></Input>
                    <Radio.Group onChange={e => { isMultilingual = e.target.value; setIsMultilingualConfig(e.target.value); setIsMultilingualEnabled(e.target.value); }} defaultValue={isMultilingual}>
                        <Radio value={true}>{L("packageEditor.main.createModal.enable")}</Radio>
                        <Radio value={false}>{L("packageEditor.main.createModal.disable")}</Radio>
                    </Radio.Group>
                    {isMultilingualEnabled ?
                        <Select
                            popupMatchSelectWidth={false}
                            placeholder={L("packageEditor.main.createModal.languagePlaceholder")}
                            size="small"
                            showSearch
                            defaultValue={translationName}
                            onChange={value => { translationName = value; setTranslationNameConfig(value); }}
                            filterOption={(input, option) =>
                                (option?.label ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                            options={allLanguages}
                        /> : null}
                </Space.Compact>
            </Space>;
        }

        // Prompt a modal for collecting conversation's name and translation setting
        modal.confirm({
            title: L("packageEditor.main.createModal.title"),
            content: <ModalConversationCreate></ModalConversationCreate>,
            okText: L("packageEditor.main.createModal.ok"),
            cancelText: L("cancel"),
            onOk: () => { newConversation(key, isMultilingual, translationName); },
            // onCancel: "",
        });
    };

    // Iterate all conversations, create tabs items
    useEffect(() => {
        const initTabsItems = [] as Tab[];
        props.package.getConversations().forEach((v, k) => {
            initTabsItems.push({
                key: k,
                label: <ConversationTabLabel label={k} package={props.package} syncYaml={props.syncYaml}></ConversationTabLabel>,
                children: <ConversationEditor key={k} conversation={v} conversationName={k} syncYaml={props.syncYaml}></ConversationEditor>,
                closeIcon: <VscTrash />,
                style: { height: "100%" }  // Maximize tab content height for ReactFlow
            });
        });
        setTabsItems(initTabsItems);
        if (initTabsItems.length && !initTabsItems.some(tabItem => tabItem.key === activeTabKey)) {
            setActiveTabKey(initTabsItems[0].key);
        }
    }, [props.package]);

    // Update current active tab key on global variable
    useEffect(() => {
        globalThis.activeTabKey = activeTabKey;
    }, [activeTabKey]);

    return (
        <>
            {
                tabsItems.length > 0 ?
                    // Conversations editor as tabs
                    <Tabs
                        type={"editable-card"}
                        onChange={onTabsChange}
                        destroyInactiveTabPane={false} // keep keep flowchart rendering when switch tabs
                        activeKey={activeTabKey}
                        onEdit={onTabsEdit}
                        items={tabsItems}
                        // tabPosition="bottom"
                        size="small"
                        style={{
                            height: "100%",
                        }}
                        tabBarStyle={{
                            color: "var(--vscode-disabledForeground)", // un-activated tab text color
                        }}
                    ></Tabs>
                    :
                    // A placeholder when there are no Conversations available
                    <div
                        style={{
                            height: "100%",
                            display: "flex",
                            alignItems: "center", // y
                            justifyContent: "center", // x
                        }}
                    >
                        <Button
                            type="default"
                            onClick={() => { onConversationCreate(); }}
                        >
                            {L("packageEditor.main.createConversation")}
                        </Button>
                    </div>
            }
            {modalContextHolder}
        </>
    );
}
