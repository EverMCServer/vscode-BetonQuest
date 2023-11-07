import React, { useEffect, useState } from "react";
import ConversationEditor from "./Main/ConversationEditor";
import ConversationTabLabel from "./Main/ConversationTabLabel";
import Package from "../../../betonquest/Package";
import { Input, Modal, Radio, Space, Tabs } from "antd";
import type { Tab } from 'rc-tabs/lib/interface';
import { VscTrash } from "react-icons/vsc";

import "../index.css";
import "./Main.css";

interface MainProps {
    package: Package,
    syncYaml: (delay?: number) => void,
}

export default function main(props: MainProps) {

    const [tabsActiveKey, setTabsActiveKey] = useState("");
    const [tabsItems, setTabsItems] = useState([] as Tab[]);
    const [modal, modalContextHolder] = Modal.useModal();

    // Function to remove a tab
    type TargetKey = React.MouseEvent | React.KeyboardEvent | string;
    const removeTab = (targetKey: TargetKey) => {

        // Iterate the tab objects, find the script key
        let lastIndex = -1;
        let newActiveKey = tabsActiveKey;
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
        setTabsActiveKey(newActiveKey);
    };

    // Handle tabs switching
    const onTabsChange = (newActiveKey: string) => {
        setTabsActiveKey(newActiveKey);
    };

    // Helper function to create new Conversation
    const newConversation = (key: string, isMultilingual: boolean, translationName: string = "en") => {
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
            children: <ConversationEditor key={key} conversation={conv} conversationName={key} syncYaml={props.syncYaml}></ConversationEditor>,
            closeIcon: <VscTrash />,
            style: { height: "100%" }  // Maximize tab content height for ReactFlow
        });
        setTabsItems(newConvs);
        setTabsActiveKey(key);

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
                    title: "Delete the Conversation!",
                    content: `Are you sure you want to delete Conversation "${targetKey}"?`,
                    okText: "DELETE",
                    okType: 'danger',
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
    const [translationNameConfig, setTranslationNameConfig] = useState('en');

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
                    <div>Name:</div>
                    <div>Multilingual:</div>
                    {isMultilingualEnabled ? <div>Language:</div> : null}
                </Space.Compact>
                <Space.Compact direction="vertical" size="small">
                    <Input
                        size="small"
                        defaultValue={key}
                        onChange={e => { key = e.target.value; setNewConversationKeyConfig(e.target.value); }}
                    ></Input>
                    <Radio.Group onChange={e => { isMultilingual = e.target.value; setIsMultilingualConfig(e.target.value); setIsMultilingualEnabled(e.target.value); }} defaultValue={isMultilingual}>
                        <Radio value={true}>Enable</Radio>
                        <Radio value={false}>Disable</Radio>
                    </Radio.Group>
                    {isMultilingualEnabled ? <Input
                        size="small"
                        defaultValue={translationName}
                        onChange={e => {translationName = e.target.value; setTranslationNameConfig(e.target.value);}}
                    ></Input> : null}
                </Space.Compact>
            </Space>;
        }

        // Prompt a modal for collecting conversation's name and translation setting
        modal.confirm({
            title: "New Conversation",
            content: <ModalConversationCreate></ModalConversationCreate>,
            okText: "Create",
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
        if (initTabsItems.length && !initTabsItems.some(tabItem => tabItem.id === tabsActiveKey)) {
            setTabsActiveKey(initTabsItems[0].key);
        }
    }, [props.package]);

    return (
        <>
            {
                tabsItems.length > 0 ?
                    // Conversations editor as tabs
                    <Tabs
                        type={"editable-card"}
                        onChange={onTabsChange}
                        destroyInactiveTabPane={false} // keep keep flowchart rendering when switch tabs
                        activeKey={tabsActiveKey}
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
                        <a
                            className="vscode-button vscode-button-secondary"
                            onClick={() => { onConversationCreate(); }}
                        >Click here to create a new Conversation</a>
                    </div>
            }
            {modalContextHolder}
        </>
    );
}
