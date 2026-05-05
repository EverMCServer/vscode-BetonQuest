/* eslint-disable @typescript-eslint/naming-convention */
import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Space, Select, Tooltip } from "antd";
import { DefaultOptionType } from "antd/es/select";
import {
    DndContext,
    DragEndEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable } from "@dnd-kit/sortable";
import { useViewport } from "reactflow";
import { VscClose, VscGoToFile } from "react-icons/vsc";

import styles from "./DraggableList.module.css";

export type Item = {
    id: number;
    text: string;
};

type TagProps = {
    tag: Item;
    onChange?: (item: Item, newText: string) => void;
    suffix?: React.ReactNode;
    itemSource?: DefaultOptionType[];
    onDropdownOpen?: () => void;
};

const getOptionText = (option?: DefaultOptionType): string => {
    if (!option) {
        return "";
    }
    if (typeof option.value === "string" || typeof option.value === "number") {
        return `${option.value}`;
    }
    if (typeof option.label === "string" || typeof option.label === "number") {
        return `${option.label}`;
    }
    return "";
};

const normalizeOptions = (itemSource?: DefaultOptionType[], extra?: string): DefaultOptionType[] => {
    const map = new Map<string, DefaultOptionType>();

    (itemSource || []).forEach((option) => {
        const text = getOptionText(option);
        if (text) {
            map.set(text, { ...option, value: text, label: option.label ?? text });
        }
    });

    if (extra && !map.has(extra)) {
        map.set(extra, { value: extra, label: extra });
    }

    return Array.from(map.values());
};

const getSelectPopupContainer = (triggerNode: HTMLElement) => {
    // Try to find the React Flow container (moves with zoom/pan, likely no overflow clipping)
    let el: HTMLElement | null = triggerNode;
    for (let i = 0; i < 20; i++) {
        if (!el) {
            break;
        }
        if (el.classList && (
            el.classList.contains("react-flow__container") ||
            el.classList.contains("react-flow__viewport") ||
            el.classList.contains("react-flow")
        )) {
            return el;
        }
        el = el.parentElement;
    }
    // Fallback to body
    return triggerNode.ownerDocument.body;
};

const renderSelectDropdown = (menu: React.ReactNode) => (
    <div onWheel={(e) => e.stopPropagation()} style={{ pointerEvents: "auto" }}>
        {menu}
    </div>
);

type SelectInputProps = {
    value: string;
    itemSource?: DefaultOptionType[];
    onConfirm: (value: string) => void;
    onCancel: () => void;
    onSearch?: (value: string) => void;
    onDropdownOpen?: () => void;
};

const SelectInput: React.FC<SelectInputProps> = ({ value, itemSource, onConfirm, onCancel, onSearch, onDropdownOpen }) => {
    const options = useMemo(() => normalizeOptions(itemSource, value), [itemSource, value]);

    useEffect(() => {
        onDropdownOpen?.();
    }, [onDropdownOpen]);

    return (
    <Select
        value={value}
        autoFocus
        showSearch
        defaultActiveFirstOption
        defaultOpen
        size="small"
        className={`nodrag ${styles.select}`}
        style={{ width: "100%" }}
        popupClassName="bq-draggable-list-select-dropdown"
        dropdownAlign={{
            points: ["tl", "bl"] as [string, string],
            overflow: { adjustX: false, adjustY: false },
        }}
        getPopupContainer={getSelectPopupContainer}
        popupMatchSelectWidth={true}
        dropdownStyle={{}}
        options={options}
        filterOption={(input, option) =>
            getOptionText(option).toLowerCase().includes(input.toLowerCase())
        }
        onDropdownVisibleChange={(open) => {
            if (open) {
                onDropdownOpen?.();
            }
        }}
        onChange={(selectedValue) => {
            const next = `${selectedValue || ""}`;
            onConfirm(next);
        }}
        onSearch={onSearch}
        onBlur={() => onConfirm(value)}
        onInputKeyDown={(event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            if (event.key === "Escape") {
                onCancel();
                event.stopPropagation();
                return;
            }
            if (event.key === "Enter") {
                event.preventDefault();
                onConfirm(value);
            }
        }}
        dropdownRender={renderSelectDropdown}
    />
    );
};

const TagElement: React.FC<TagProps> = ({ tag, onChange, suffix, itemSource, onDropdownOpen }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tag.id });

    const viewport = useViewport(); // Compensates ReactFlow's zooming

    const style: React.CSSProperties = transform
        ? {
            transform: `translate3d(${transform.x / viewport.zoom}px, ${transform.y / viewport.zoom}px, 0)`,
            transition: isDragging ? "unset" : transition,
        }
        : {};

    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(tag.text);
    const isEditingRef = useRef(false);
    const inputContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isEditing) {
            setInputValue(tag.text);
        }
    }, [tag.text, isEditing]);

    const onEditingStart = () => {
        isEditingRef.current = true;
        setInputValue(tag.text);
        setIsEditing(true);
    };

    const onEditingEnd = (value: string) => {
        if (!isEditingRef.current) {
            return;
        }
        isEditingRef.current = false;
        setIsEditing(false);
        onChange && onChange(tag, value);
    };

    return (
        <div
            style={style}
            className={`nodrag ${styles.tag} ${styles.tagRow} ${isEditing ? styles.tagRowEditing : ""}`}
            ref={setNodeRef}
            {...attributes}
            {...(!isEditing && listeners)}
        >
            <Space.Compact block>
                <div
                    ref={inputContainerRef}
                    onDoubleClick={onEditingStart}
                    style={{ width: isEditing ? "100%" : "inherit", overflow: "hidden" }}
                >
                    {isEditing ? (
                        <SelectInput
                            value={inputValue}
                            itemSource={itemSource}
                            onConfirm={onEditingEnd}
                            onCancel={() => {
                                isEditingRef.current = false;
                                setInputValue(tag.text);
                                setIsEditing(false);
                            }}
                            onSearch={setInputValue}
                            onDropdownOpen={onDropdownOpen}
                        />
                    ) : (
                        <span className={styles.text}>{tag.text}</span>
                    )}
                </div>
                {!isEditing ? suffix : null}
            </Space.Compact>
        </div>
    );
};

type DraggableTagProps = {
    itemSource?: DefaultOptionType[];
    items?: string[];
    onAdd?: (newItem: string, pos: number, newItems: string[]) => void;
    onRemove?: (item: string, pos: number, newItems: string[]) => void;
    onSort?: (newItems: string[]) => void;
    onChange?: (newItem: string, pos: number, newItems: string[]) => void;
    onGotoClick?: (item: string, pos: number) => void;
    onGotoClickTooltip?: string;
    newTagText?: React.ReactElement | string;
    tagTextPattern?: RegExp; // Keep existing API; currently no strict enforcement
    onDropdownOpen?: () => void;
};

const App: React.FC<DraggableTagProps> = ({
    itemSource,
    items,
    onAdd,
    onRemove,
    onSort,
    onChange,
    onGotoClick,
    onGotoClickTooltip,
    newTagText,
    onDropdownOpen,
}) => {
    const [tags, setTags] = useState<Item[]>([]);
    const [inputVisible, setInputVisible] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const inputVisibleRef = useRef(false);
    const addRowContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (items) {
            setTags(items.map((str, i) => ({ id: i + 1, text: str } as Item)));
        }
    }, [items]);

    useEffect(() => {
        inputVisibleRef.current = inputVisible;
    }, [inputVisible]);

    const handleClose = (removedTag: Item) => {
        let deletedTag: Item | undefined;
        const newTags = tags.filter((tag) => {
            if (tag.id !== removedTag.id) {
                return true;
            } else {
                deletedTag = tag;
            }
            return false;
        });
        onRemove && onRemove(deletedTag?.text ?? "", (deletedTag?.id ?? 0) - 1, newTags.map((e) => e.text));
        setTags(newTags);
    };

    const showInput = () => {
        inputVisibleRef.current = true;
        setInputVisible(true);
        setInputValue("");
    };

    const hideInput = () => {
        inputVisibleRef.current = false;
        setInputVisible(false);
        setInputValue("");
    };

    const handleInputConfirm = (value: string) => {
        if (!inputVisibleRef.current) {
            return;
        }
        const inputText = value || "";

        if (inputText && !tags.some((tag) => tag.text === inputText)) {
            const newTag: Item = { id: tags.length + 1, text: inputText };
            const newTags = [...tags, newTag];
            setTags(newTags);
            onAdd && onAdd(newTag.text, newTag.id - 1, newTags.map((e) => e.text));
        }
        hideInput();
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) {
            return;
        }

        if (active.id !== over.id) {
            const oldIndex = tags.findIndex((tag) => tag.id === active.id);
            const newIndex = tags.findIndex((tag) => tag.id === over.id);
            const newTags = arrayMove(tags, oldIndex, newIndex);
            setTags(newTags);
            onSort && onSort(newTags.map((e) => e.text));
        }
    };

    const handleTagChange = (tag: Item, newText: string) => {
        const newTags = tags.map(t => t.id === tag.id ? { ...t, text: newText } : t);
        setTags(newTags);
        onChange && onChange(newText, tag.id - 1, newTags.map((e) => e.text));
    };

    return (
        <DndContext
            sensors={sensors}
            onDragEnd={handleDragEnd}
            autoScroll={false} // Prevent page scroll when dragging to the edge
        >
            <SortableContext items={tags}>
                <Space direction="vertical" size="small" style={{ width: "100%" }}>
                    {tags.map((tag) => (
                        <TagElement
                            tag={tag}
                            key={tag.id}
                            onChange={handleTagChange}
                            itemSource={itemSource}
                            onDropdownOpen={onDropdownOpen}
                            suffix={
                                <>
                                    {onGotoClick && (
                                        <>
                                            <Tooltip title={onGotoClickTooltip}>
                                                <VscGoToFile
                                                    style={{ cursor: "pointer", height: "inherit" }}
                                                    onClick={(e) => {
                                                        if (onGotoClick) {
                                                            onGotoClick(tag.text, tag.id - 1);
                                                            e.stopPropagation();
                                                        }
                                                    }}
                                                />
                                            </Tooltip>
                                            &nbsp;
                                        </>
                                    )}
                                    <VscClose
                                        style={{ cursor: "pointer", height: "inherit" }}
                                        onClick={(e) => {
                                            handleClose(tag);
                                            e.stopPropagation();
                                        }}
                                    />
                                </>
                            }
                        />
                    ))}
                    <div
                        ref={addRowContainerRef}
                        onClick={inputVisible ? undefined : showInput}
                        style={{ cursor: inputVisible ? "default" : "pointer", overflow: "hidden" }}
                        className={`nodrag ${styles.tag} ${styles.tagRow} ${inputVisible ? styles.tagRowEditing : ""}`}
                    >
                        {inputVisible ? (
                            <SelectInput
                                value={inputValue}
                                itemSource={itemSource}
                                onConfirm={handleInputConfirm}
                                onCancel={hideInput}
                                onSearch={setInputValue}
                                onDropdownOpen={onDropdownOpen}
                            />
                        ) : (
                            <span className={styles.text}>{newTagText ?? <>+ New Tag</>}</span>
                        )}
                    </div>
                </Space>
            </SortableContext>
        </DndContext>
    );
};

export default App;
