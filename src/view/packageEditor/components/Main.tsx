import React, { useEffect, useState } from "react";
import ConversationEditor from "./Main/ConversationEditor";
import ConversationTabLabel from "./Main/ConversationTabLabel";
import Package from "../../../betonquest/Package";
import { Modal, Tabs } from "antd";
import type { Tab } from 'rc-tabs/lib/interface';
import { VscTrash } from "react-icons/vsc";

import "./Main.css";

interface MainProps {
    package: Package,
    syncYaml: Function,
}

export default function main( props: MainProps ) {
    console.log("prpos.test in main:", props.package);

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

    // Handle tabs addition / removal
    const onTabsEdit = (
        targetKey: TargetKey,
        action: 'add' | 'remove',
    ) => {
        switch (action) {
            case 'add':
                // Create new key, Conversation's script name
                let key = "new_conv";
                let count = 2;
                const allConv = props.package.getConversations();
                for (;allConv.has(key);) {
                    key = `new_conv_${count++}`;
                };

                // Create new Conversation on package
                const conv = props.package.createConversation(key, key);
                if (!conv) {
                    break;
                }

                // Create new tab and update the view
                const newConvs = [...tabsItems];
                newConvs.push({
                    key: key,
                    label: <ConversationTabLabel label={key} package={props.package} syncYaml={props.syncYaml}></ConversationTabLabel>,
                    children: <ConversationEditor key={key} conversation={conv} syncYaml={props.syncYaml}></ConversationEditor>,
                    closeIcon: <VscTrash />,
                    style: {height: "100%"}  // Maximize tab content height for ReactFlow
                });
                setTabsItems(newConvs);
                setTabsActiveKey(key);

                // Sync yaml back to VSCode
                props.syncYaml();

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


    // Iterate all conversations, create tabs items
    useEffect(() => {
        const initTabsItems = [] as Tab[];
        props.package.getConversations().forEach((v, k)=>{
            initTabsItems.push({
                key: k,
                label: <ConversationTabLabel label={k} package={props.package} syncYaml={props.syncYaml}></ConversationTabLabel>,
                children: <ConversationEditor key={k} conversation={v} syncYaml={props.syncYaml}></ConversationEditor>,
                closeIcon: <VscTrash />,
                style: {height: "100%"}  // Maximize tab content height for ReactFlow
            });
        });
        if (initTabsItems.length) {
            setTabsItems(initTabsItems);
            if (tabsActiveKey === "") {
                setTabsActiveKey(initTabsItems[0].key);
            }
        }
    }, [props.package]);

    return(
        <>
            <Tabs
                type={"editable-card"}
                onChange={onTabsChange}
                destroyInactiveTabPane={true}
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
            {modalContextHolder}
        </>
    );
}