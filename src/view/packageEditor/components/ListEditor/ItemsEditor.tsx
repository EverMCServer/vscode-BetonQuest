import React, { useEffect, useState } from "react";
import Package from "../../../../betonquest/Package";

interface ItemsEditorProps {
    package: Package,
    syncYaml: Function,
}

export default function itemsEditor(props: ItemsEditorProps) {

    return (
        <>
            Items Editor...<br />
        </>
    );
}