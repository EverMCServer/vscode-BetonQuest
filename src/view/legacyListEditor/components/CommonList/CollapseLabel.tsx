import React, { useState, KeyboardEvent, ChangeEvent, useEffect } from "react";

import { VscEdit } from "react-icons/vsc";

import { CommonListProps } from "../CommonList";
import ListElement from "../../../../betonquest/ListElement";
import { Input, Popover, Tooltip } from "antd";
import { SpecialCharactersRegex } from "../../../../utils/yaml";

let editPopoverTimeout: string | number | NodeJS.Timeout | undefined;

interface CollapseLabelProps<T extends ListElement> extends CommonListProps<T> {
    listElement: T,
    onListElementRemane: (oldName: string, newName: string) => void
}

export default function <T extends ListElement>(props: CollapseLabelProps<T>) {

    // Cache title name
    const [title, setTitle] = useState("");
    useEffect(() => {
        setTitle(props.listElement.getName());
    }, [props.listElement]);

    // Show rename input
    const [isTitleEditing, setIsTitleEditing] = useState(false);

    // Cache editing value
    const [titleEditValue, setTitleEditValue] = useState("");
    const onTitleEditTyping = (e: ChangeEvent<HTMLInputElement>) => {
        setTitleEditValue(e.target.value);
    };
    // Update edited value
    const onTitleEditEnd = () => {
        // Check if name duplicated
        if (title !== titleEditValue) {
            // Display a Popover for notice
            clearTimeout(editPopoverTimeout);
            setIsShowEditPopover(true);
            setEditPopoverMessage(`Duplicated name "${titleEditValue}"! Please change it.`);
            editPopoverTimeout = setTimeout(() => {
                setIsShowEditPopover(false);
            }, 2000);
            return;
        }
        // Disable editor input
        setIsTitleEditing(false);
        // Set display
        setTitle(titleEditValue);
        // Update Parent List element key
        props.onListElementRemane(props.listElement.getName(), titleEditValue);
        // Set YAML
        props.listElement.setName(titleEditValue);
        props.syncYaml();
        return;
    };
    // Switch "done", "cancel" and prevent disallowed characters
    const onTitleEdit = (e: KeyboardEvent<HTMLInputElement>) => {
        switch (e.key) {
            case 'Enter':
                // Save edit
                e.stopPropagation();
                e.preventDefault();
                onTitleEditEnd();
                return;
            case 'Escape':
            case 'Tab':
                // Cancel edit
                setIsTitleEditing(false);
                return;
            default:
                // Prevent disallowed characters (special YAML characters)
                if (e.key.match(SpecialCharactersRegex)) {
                    e.stopPropagation();
                    e.preventDefault();
                    return;
                }
        }
    };

    // Warn about duplicate name etc
    const [isShowEditPopover, setIsShowEditPopover] = useState(false);
    const [editPopoverMessage, setEditPopoverMessage] = useState<React.ReactNode>("");

    return (
        <div style={{ padding: "0 0 4px 0" }}>
            {isTitleEditing ?
                <Popover
                    content={editPopoverMessage}
                    open={isShowEditPopover}
                    placement="topLeft"
                >
                    <Input
                        autoFocus
                        defaultValue={title}
                        placeholder="Please enter the name of event"
                        value={titleEditValue}
                        onChange={onTitleEditTyping}
                        onBlur={() => setIsTitleEditing(false)}
                        onKeyDown={onTitleEdit}
                        onClick={e => e.stopPropagation()}
                        size="small"
                    />
                </Popover>
                :
                <>
                    <span
                        style={{ color: 'var(--vscode-input-foreground)' }}
                        onDoubleClick={e => {
                            setIsTitleEditing(true);
                        }}
                    >
                        {title}
                    </span>
                    &nbsp;
                    <Tooltip placement="right" title="Rename">
                        <VscEdit
                            style={{
                                color: 'var(--vscode-tab-inactiveForeground)',
                            }}
                            onClick={e => {
                                e.stopPropagation();
                                setIsTitleEditing(true);
                                setTitleEditValue(title); // Reset editor initial value
                            }}
                        />
                    </Tooltip>
                </>
            }
        </div>
    );
}