/* eslint-disable @typescript-eslint/naming-convention */
import React, { useEffect, useRef, useState } from 'react';
import type { InputRef } from 'antd';
import { Space, Input } from 'antd';
import { DndContext, DragEndEvent, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { useViewport } from 'reactflow';
import { VscClose } from 'react-icons/vsc';

import styles from './DraggableList.module.css';

export type Item = {
    id: number;
    text: string;
};

type TagProps = {
    tag: Item;
    removeTag: (item: Item) => void;
    onChange?: (item: Item) => void;
    onClick?: (item: string, pos: number) => void;
};

const TagElement: React.FC<TagProps> = ({ tag, removeTag, onChange, onClick }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tag.id });

    const viewport = useViewport(); // Compensates ReactFlow's zooming

    const style: React.CSSProperties = transform ? {
        transform: `translate3d(${transform.x / viewport.zoom}px, ${transform.y / viewport.zoom}px, 0)`,
        transition: isDragging ? 'unset' : transition,
    } : {};

    const [isEditing, setIsEditing] = useState(false);

    const onEditingStart = () => {
        setIsEditing(true);
        console.log("a");
    };

    const onInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        onEditingEnd(e.target.value);
    };
    const onInputEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        onEditingEnd(e.currentTarget.value);
    };
    const onEditingEnd = (value: string) => {
        setIsEditing(false);
        tag.text = value;
        onChange && onChange(tag);
    };

    return (
        <div
            style={style}
            className={`nodrag ${styles.tag}`}
            ref={setNodeRef}
            {...attributes}
            {...(!isEditing && listeners)}
        >
            <Space.Compact block>
                <div
                    onDoubleClick={onEditingStart}
                    onClick={() => onClick && onClick(tag.text, tag.id - 1)}
                    style={{ width: 'inherit', overflow: 'hidden' }}
                >
                    {isEditing ?
                        <Input
                            autoFocus={true}
                            defaultValue={tag.text}
                            onBlur={onInputBlur}
                            onPressEnter={onInputEnter}
                            onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                if (e.key === 'Escape') {
                                    setIsEditing(false);
                                }
                            }}
                            size='small'
                            style={{ padding: 0 }}
                            bordered={false}
                        />
                        : tag.text
                    }
                </div>
                {!isEditing ? <VscClose style={{ cursor: 'pointer', height: 'inherit' }} onClick={() => removeTag(tag)} /> : null}
            </Space.Compact>
        </div >
    );
};

type DraggableTagProps = {
    items?: string[];
    onAdd?: (newItem: string, pos: number, newItems: string[]) => void;
    onRemove?: (item: string, pos: number, newItems: string[]) => void;
    onSort?: (newItems: string[]) => void;
    onChange?: (newItem: string, pos: number, newItems: string[]) => void; // TODO
    onTagClick?: (item: string, pos: number) => void;
    newTagText?: React.ReactElement | string;
    tagTextPattern?: RegExp; // Check tag's text pattern, prevent unwanted characters etc.
};

const App: React.FC<DraggableTagProps> = ({ items, onAdd, onRemove, onSort, onChange, onTagClick, newTagText, tagTextPattern }) => {
    const [tags, setTags] = useState<Item[]>([]);
    const [inputVisible, setInputVisible] = useState(false);
    const inputRef = useRef<InputRef>(null);

    useEffect(() => {
        if (items) {
            setTags(items.map((str, i) => { return { id: i + 1, text: str } as Item; }));
        }
    }, [items]);

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
        onRemove && onRemove(deletedTag?.text ?? "", (deletedTag?.id ?? 0) - 1, newTags.map(e => e.text));
        setTags(newTags);
    };

    const onInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        handleInputConfirm(e.target.value);
    };
    const onInputEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        handleInputConfirm(e.currentTarget.value);
    };
    const handleInputConfirm = (inputValue: string) => {
        if (inputValue && !tags.some((tag) => tag.text === inputValue)) {
            const newTag: Item = { id: tags.length + 1, text: inputValue };
            const newTags = [...tags, newTag];
            setTags(newTags);
            onAdd && onAdd(newTag.text, newTag.id - 1, newTags.map(e => e.text));
        }
        setInputVisible(false);
    };

    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8,
        },
    }));

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) { return; }

        if (active.id !== over.id) {
            const oldIndex = tags.findIndex((tag) => tag.id === active.id);
            const newIndex = tags.findIndex((tag) => tag.id === over.id);
            const newTags = arrayMove(tags, oldIndex, newIndex);
            setTags(newTags);
            onSort && onSort(newTags.map(e => e.text));
        }
    };

    const handleTagChange = (tag: Item) => {
        // const newTags = tags.map(t => t.id === tag.id ? tag : t);
        onChange && onChange(tag.text, tag.id - 1, tags.map(e => e.text));
    };

    return (
        <DndContext
            sensors={sensors}
            onDragEnd={handleDragEnd}
            // collisionDetection={closestCenter}
            autoScroll={false} // Prevent page scroll when dragging to the edge
        >
            <SortableContext
                items={tags}
            // strategy={horizontalListSortingStrategy}
            >
                <Space direction="vertical" size="small" style={{ width: "100%" }}>
                    {tags.map((tag) => (
                        <TagElement tag={tag} key={tag.id} removeTag={handleClose} onChange={handleTagChange} onClick={onTagClick} />
                    ))}
                    <div
                        onClick={() => setInputVisible(true)}
                        style={{ cursor: 'pointer' }}
                        className={`nodrag ${styles.tag}`}
                    >
                        {inputVisible ? (
                            <Input
                                ref={inputRef}
                                autoFocus={true}
                                onBlur={onInputBlur}
                                onPressEnter={onInputEnter}
                                onKeyUp={(e) => {
                                    if (e.key === 'Escape') {
                                        setInputVisible(false);
                                    }
                                }}
                                // pattern={tagTextPattern}
                                onInput={event => {
                                    if (tagTextPattern && !tagTextPattern.test(event.currentTarget.value)) {
                                        // console.log("failed check");
                                        // TODO
                                    }
                                }}
                                size="small"
                                className='nodrag'
                                type="text"
                                style={{ padding: 0 }}
                                bordered={false}

                            />
                        ) : (
                            <>{newTagText ?? <>+ New Tag</>}</>
                        )}
                    </div>
                </Space>
            </SortableContext>
        </DndContext>
    );
};

export default App;
