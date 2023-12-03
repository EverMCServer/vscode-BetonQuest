import React, { MouseEvent } from "react";

import { VscTrash } from "react-icons/vsc";

import { CommonListProps } from "../CommonList";
import ListElement from "../../../../../betonquest/ListElement";

interface CollapseExtraProps<T extends ListElement> extends CommonListProps<T> {
    listElement: T
}

export default function <T extends ListElement>(props: CollapseExtraProps<T>) {

    // Handle remove
    const onElementRemove = (e: MouseEvent) => {
        e.stopPropagation();
        console.log("on delete");
        // TODO: use Popover for deletion confirm
    };
    // ...

    return (
        <>
            <VscTrash style={{ margin: '0 6px 0 0' }} onClick={onElementRemove} />
        </>
    );
}