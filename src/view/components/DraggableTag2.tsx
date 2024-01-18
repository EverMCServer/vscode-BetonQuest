/* eslint-disable @typescript-eslint/naming-convention */
import React, { useEffect, useRef, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';
import { Space, Input, Tag } from 'antd';
import { DndContext, DragEndEvent, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';

import L from '../../i18n/i18n';

import { SortableContainer, SortableElement } from 'react-sortable-hoc';

const SortableItem = SortableElement(({ value }: { value: string }) =>
    <div className='nodrag'>{value}</div>
);

const SortableList = SortableContainer(({ items }: { items: string[] }) => {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                width: "100%"
            }}
        >
            {items.map((value, index) => (
                <SortableItem key={`item-${index}`} index={index} value={value} />
            ))}
        </div>
    );
});

export default class SortableComponent extends React.Component<{}, { items: string[] }> {
    constructor(props: {}) {
        super(props);
        this.state = {
            items: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6', 'Item 7', 'Item 8', 'Item 9']
        };
    }
    public render() {
        return <SortableList items={this.state.items} onSortEnd={this.onSortEnd} axis='x' />;
    }
    private onSortEnd = ({ oldIndex, newIndex }: { oldIndex: number, newIndex: number }) => {
        this.setState({
            items: arrayMove(this.state.items, oldIndex, newIndex),
        });
    };
}
