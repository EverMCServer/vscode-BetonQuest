import React from "react";
import Package from "betonquest-utils/betonquest/Package";

interface ItemsListProps {
    package: Package,
    syncYaml: Function,
}

export default function itemsList(props: ItemsListProps) {

    return (
        <>
            Items List...<br />
        </>
    );
}