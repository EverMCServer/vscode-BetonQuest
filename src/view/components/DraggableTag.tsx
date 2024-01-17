/* eslint-disable @typescript-eslint/naming-convention */
import React, { useEffect, useRef, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';
import { Space, Input, Tag } from 'antd';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';

import L from '../../i18n/i18n';

export type Item = {
    id: string;
    text: string;
};

type TagProps = {
    tag: Item;
    index: number;
    removeTag: (tag: string) => void;
};

const TagElement: React.FC<TagProps> = ({ tag, index, removeTag }) => {
    const { listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tag.id });

    const commonStyle = {
        cursor: 'move',
        transition: 'unset',
    };

    const style = transform
        ? {
            ...commonStyle,
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
            transition: isDragging ? 'unset' : transition,
        }
        : commonStyle;

    return (
        <Tag
            style={style}
            ref={setNodeRef}
            {...listeners}
            closable={true}
            onClose={() => removeTag(tag.text)}
            className='nodrag'
        >
            {tag.text}
        </Tag>
    );
};

type DraggableTagProps = {
    items?: Item[];
    onAdd?: (item: Item) => void;
    onRemove?: (tag: Item) => void;
    onChange?: (items: Item[]) => void;
    onTagChange?: (items: Item) => void;
};

const App: React.FC<DraggableTagProps> = ({ items, onAdd, onRemove, onChange, onTagChange }) => {
    const [tags, setTags] = useState<Item[]>(items ?? []);
    const [inputVisible, setInputVisible] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<InputRef>(null);

    useEffect(() => {
        if (items) {
            setTags(items);
        }
    }, [items]);

    useEffect(() => {
        if (inputVisible) {
            inputRef.current?.focus();
        }
    }, [inputVisible]);

    const handleClose = (removedTag: string) => {
        const newTags = tags.filter((tag) => tag.text !== removedTag || (onRemove && onRemove(tag)));
        setTags(newTags);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleInputConfirm = () => {
        if (inputValue && !tags.some((tag) => tag.text === inputValue)) {
            const newTag = { id: `${tags.length + 1}`, text: inputValue };
            setTags([...tags, newTag]);
            onTagChange && onTagChange(newTag);
        }
        setInputVisible(false);
        setInputValue('');
    };

    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8,
        },
    }));

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (!over) { return; }

        if (active.id !== over.id) {
            const oldIndex = tags.findIndex((tag) => tag.id === active.id);
            const newIndex = tags.findIndex((tag) => tag.id === over.id);
            const newTags = arrayMove(tags, oldIndex, newIndex);
            setTags(newTags);
            onChange && onChange(newTags);
        }
    };

    return (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
            <SortableContext items={tags} strategy={horizontalListSortingStrategy}>
                <Space size={[0, 8]} wrap>
                    {tags.map((tag, index) => (
                        <TagElement tag={tag} index={index} key={tag.id} removeTag={handleClose} />
                    ))}
                    {inputVisible ? (
                        <Input
                            ref={inputRef}
                            type="text"
                            size="small"
                            value={inputValue}
                            onChange={handleInputChange}
                            onBlur={handleInputConfirm}
                            onPressEnter={handleInputConfirm}
                            className='nodrag'
                        />
                    ) : (
                        <Tag onClick={() => setInputVisible(true)} className='nodrag'>
                            <PlusOutlined /> New Tag
                        </Tag>
                    )}
                </Space>
            </SortableContext>
        </DndContext>
    );
};

export default App;
