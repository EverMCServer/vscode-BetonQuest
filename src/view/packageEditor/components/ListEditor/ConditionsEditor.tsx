import React, { useEffect, useState } from "react";
import Package from "../../../../betonquest/Package";

interface ConditionsEditorProps {
    package: Package,
    syncYaml: Function,
}

export default function conditionsEditor(props: ConditionsEditorProps) {

    return (
        <>
            Conditions Editor...<br />
        </>
    );
}