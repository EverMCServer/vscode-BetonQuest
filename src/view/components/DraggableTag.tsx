import React, { useEffect, useRef, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';
import { Space, Input, Tag } from 'antd';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';

type Item = {
    id: string;
    text: string;
};

type DraggableTagProps = {
    tag: Item;
    index: number;
    removeTag: (tag: string) => void;
};

const TagElement: React.FC<DraggableTagProps> = ({ tag, index, removeTag }) => {
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
        >
            {tag.text}
        </Tag>
    );
};

const App: React.FC = () => {
    const [tags, setTags] = useState<Item[]>([
        { id: '1', text: 'Tag 1' },
        { id: '2', text: 'Tag 2' },
        { id: '3', text: 'Tag 3' },
    ]);
    const [inputVisible, setInputVisible] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<InputRef>(null);

    useEffect(() => {
        if (inputVisible) {
            inputRef.current?.focus();
        }
    }, [inputVisible]);

    const handleClose = (removedTag: string) => {
        const newTags = tags.filter((tag) => tag.text !== removedTag);
        setTags(newTags);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleInputConfirm = () => {
        if (inputValue && !tags.some((tag) => tag.text === inputValue)) {
            setTags([...tags, { id: `${tags.length + 1}`, text: inputValue }]);
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
            setTags(arrayMove(tags, oldIndex, newIndex));
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
                        />
                    ) : (
                        <Tag onClick={() => setInputVisible(true)}>
                            <PlusOutlined /> New Tag
                        </Tag>
                    )}
                </Space>
            </SortableContext>
        </DndContext>
    );
};

export default App;
