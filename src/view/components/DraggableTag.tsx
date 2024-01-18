/* eslint-disable @typescript-eslint/naming-convention */
import React, { useEffect, useRef, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';
import { Space, Input, Tag } from 'antd';
import { DndContext, DragEndEvent, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';

import L from '../../i18n/i18n';

export type Item = {
    id: number;
    text: string;
};

type TagProps = {
    tag: Item;
    removeTag: (tag: string) => void;
    onChange?: (item: Item) => void;
    onClick?: (item: Item) => void;
};

const TagElement: React.FC<TagProps> = ({ tag, removeTag, onChange, onClick }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tag.id });

    const commonStyle: React.CSSProperties = {
        cursor: 'move',
        transition: 'unset',
        padding: '0 8px 0 0'
    };

    const style: React.CSSProperties = transform ? {
        ...commonStyle,
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        transition: isDragging ? 'unset' : transition,
    } : commonStyle;

    const [isEditing, setIsEditing] = useState(false);

    const onEditingStart = () => {
        setIsEditing(true);
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
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className='nodrag'
        >
            <div
                style={{
                    border: "solid 2px",
                    padding: "2px 8px"
                }}
            >
            {tag.text}
            </div>
        </div>
        // <Tag
        //     style={style}
        //     ref={setNodeRef}
        //     {...listeners}
        //     closable={!isEditing}
        //     onClose={() => removeTag(tag.text)}
        //     className='nodrag'
        //     onDoubleClick={onEditingStart}
        //     onClick={() => onClick && onClick(tag)}
        // >
        //     {isEditing ?
        //         <Input
        //             defaultValue={tag.text}
        //             autoFocus={true}
        //             onBlur={onInputBlur}
        //             onPressEnter={onInputEnter}
        //             size='small'
        //             bordered={false}
        //         />
        //         : tag.text
        //     }
        // </Tag>
    );
};

type DraggableTagProps = {
    items?: string[];
    onAdd?: (items: Item[], item?: Item) => void;
    onRemove?: (items: Item[], item?: Item) => void;
    onSort?: (items: Item[]) => void;
    onChange?: (items: Item[], item?: Item) => void; // TODO
    onTagClick?: (item: Item) => void;
};

const App: React.FC<DraggableTagProps> = ({ items, onAdd, onRemove, onSort, onChange, onTagClick }) => {
    const [tags, setTags] = useState<Item[]>([
        { id: 1, text: 'a' },
        { id: 2, text: 'b' },
        { id: 3, text: 'c' },
        { id: 4, text: 'd' },
        { id: 5, text: 'e' },
        { id: 6, text: 'f' },
    ]);
    const [inputVisible, setInputVisible] = useState(false);
    const inputRef = useRef<InputRef>(null);

    useEffect(() => {
        if (items) {
            setTags(items.map((str, i) => { return { id: i + 1, text: str } as Item; }));
        }
    }, [items]);

    const handleClose = (removedTag: string) => {
        let deletedTag: Item | undefined;
        const newTags = tags.filter((tag) => {
            if (tag.text !== removedTag) {
                return true;
            } else {
                deletedTag = tag;
            }
            return false;
        });
        onRemove && onRemove(newTags, deletedTag);
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
            onAdd && onAdd(newTags, newTag);
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
            onSort && onSort(newTags);
        }
    };

    const handleTagChange = (tag: Item) => {
        // const newTags = tags.map(t => t.id === tag.id ? tag : t);
        onChange && onChange(tags, tag);
    };

    return (
        <DndContext
            sensors={sensors}
            onDragEnd={handleDragEnd}
        // collisionDetection={closestCenter}
        // autoScroll={false} // todo remove
        >
            <SortableContext
                items={tags}
            // strategy={horizontalListSortingStrategy}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        flexWrap: "wrap",
                        width: "100%"
                    }}
                >
                    {tags.map((tag) => (
                        <TagElement tag={tag} key={tag.id} removeTag={handleClose} onChange={handleTagChange} onClick={onTagClick} />
                    ))}
                    {/* {inputVisible ? (
                        <Input
                            ref={inputRef}
                            onBlur={onInputBlur}
                            onPressEnter={onInputEnter}
                            className='nodrag'
                            type="text"
                            size="small"
                            autoFocus={true}
                        />
                    ) : (
                        <Tag onClick={() => setInputVisible(true)} className='nodrag'>
                            <PlusOutlined /> New Tag
                        </Tag>
                    )} */}
                </div>
            </SortableContext>
        </DndContext>
    );
};

export default App;
