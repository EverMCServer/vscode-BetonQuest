import * as React from "react";
import { useState } from "react";
import { Modal } from "antd";
import L from "betonquest-utils/i18n/i18n";
import Package from "betonquest-utils/betonquest/Package";

interface ConversationTabLabelProps {
    label: string,
    package: Package,
    syncYaml: Function,
}

// Label node for Conversation tabs
export default function conversationTabLabel(props: ConversationTabLabelProps) {
    const [oldValue, setOldValue] = useState(props.label);
    const [inputValue, setInputValue] = useState(props.label);
    const [isSetValueError, setIsSetValueError] = useState(false);

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        setIsSetValueError(false);
    };

    const [isConvTabLabelModalOpen, setIsConvTabLabelModalOpen] = useState(false);

    const onDoubleClick = () => {
        setIsConvTabLabelModalOpen(true);
    };

    const onModalOk = () => {
        if (!props.package.setConversationScriptName(oldValue, inputValue)) {
            // Failed to set key
            console.log(`Can not set conversation script name to ${inputValue} due to duplicates or unkonwn errors.`);
            // Notify user by change UI element e.g. set text to red.
            setIsSetValueError(true);
            return;
        }
        setIsConvTabLabelModalOpen(false);
        setOldValue(inputValue);
        props.syncYaml();
    };

    const onModalCancel = () => {
        setIsConvTabLabelModalOpen(false);
    };

    return (
        <>
            <div onDoubleClick={onDoubleClick}>{oldValue}</div>
            <Modal
                open={isConvTabLabelModalOpen}
                onOk={onModalOk}
                onCancel={onModalCancel}
                okText={L("packageEditor.main.conversationTabLabel.rename.ok")}
                cancelText={L("cancel")}
                destroyOnClose={true}
            >
                <div>{L("packageEditor.main.conversationTabLabel.rename.content")}</div>
                <input value={inputValue} onChange={onInputChange} placeholder={props.label} style={isSetValueError ? { color: "red" } : undefined}></input>
                {isSetValueError ? <div style={{ color: "red" }}>{L("packageEditor.main.conversationTabLabel.rename.duplicated", [inputValue])}</div> : undefined}
            </Modal>
        </>
    );
}
