import React, { useEffect, useState } from "react";
import Package from "../../../../betonquest/Package";

interface ConditionsListProps {
    package: Package,
    syncYaml: Function,
}

export default function conditionsList(props: ConditionsListProps) {

    return (
        <>
            Conditions List...<br />
        </>
    );
}