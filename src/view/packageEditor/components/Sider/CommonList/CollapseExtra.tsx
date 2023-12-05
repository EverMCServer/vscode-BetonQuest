import React from "react";
import { Popconfirm } from "antd";
import { VscTrash, VscWarning } from "react-icons/vsc";

import { CommonListProps } from "../CommonList";
import ListElement, { ListElementType } from "../../../../../betonquest/ListElement";

import "../../../../style/vscodePopover.css";

interface CollapseExtraProps<T extends ListElement> extends CommonListProps<T> {
    name: string,
    removeElement: (type: ListElementType, name: string) => void,
}

export default function <T extends ListElement>(props: CollapseExtraProps<T>) {

    // Handle remove
    const onElementRemove = () => {
        // Remove from parent collapse
        props.removeElement(props.type, props.name);
    };

    return (
        <>
            <Popconfirm
                icon={
                    <VscWarning
                        style={{
                            color: "var(--vscode-notificationsWarningIcon-foreground)",
                            margin: "0 4px",
                        }}
                    />
                }
                onConfirm={onElementRemove}
                placement="topRight"
                title={`Are you sure you want to delete "${props.name}"?`}
                okText="Delete"
                cancelText="Cancel"
                onPopupClick={e => e.stopPropagation()} // Prevent parent Collapse being toggled when clicked
            >
                <VscTrash
                    style={{
                        margin: '0 6px 0 0',
                        color: 'var(--vscode-activityBar-inactiveForeground)',
                    }}
                    onClick={e => e.stopPropagation()} // Prevent parent Collapse being toggled when clicked
                    title="Delete"
                />
            </Popconfirm>
        </>
    );
}