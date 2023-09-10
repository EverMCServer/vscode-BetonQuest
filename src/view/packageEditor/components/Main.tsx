import React, { useEffect, useState } from "react";
import ConversationEditor from "./Main/ConversationEditor";
import Package from "../../../betonquest/Package";
import { Tabs } from "antd";
import type { Tab } from 'rc-tabs/lib/interface';

interface MainProps {
    package: Package,
    syncYaml: Function,
}

export default function main( props: MainProps ) {
    console.log("prpos.test in main:", props.package);

    const [tabsActiveKey, setTabsActiveKey] = useState("");
    const [tabsItems, setTabsItems] = useState([] as Tab[]);

    // Handle tabs switching
    const onTabsChange = (newActiveKey: string) => {
        setTabsActiveKey(newActiveKey);
    };

    // Handle tabs addition / removal
    const onTabsEdit = (
        targetKey: React.MouseEvent | React.KeyboardEvent | string,
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

                // Create new tab and update the view
                const newConvs = [...tabsItems];
                newConvs.push({
                    key: key,
                    label: key,
                    children: <ConversationEditor key={key} conversation={conv} syncYaml={props.syncYaml}></ConversationEditor>
                });
                setTabsItems(newConvs);
                setTabsActiveKey(key);

                // Sync yaml back to VSCode
                props.syncYaml();

                break;
            case 'remove':
                break;
        }
    };


    // Iterate all conversations, create tabs items
    useEffect(() => {
        const initTabsItems = [] as Tab[];
        props.package.getConversations().forEach((v, k)=>{
            initTabsItems.push({
                key: k,
                label: k,
                children: <ConversationEditor key={k} conversation={v} syncYaml={props.syncYaml}></ConversationEditor>,
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
            main component
            <Tabs
                type={"editable-card"}
                onChange={onTabsChange}
                activeKey={tabsActiveKey}
                onEdit={onTabsEdit}
                items={tabsItems}
                tabPosition="bottom"
                style={{
                    height: "100%"
                }}
            ></Tabs>
            
        </>
    );
}