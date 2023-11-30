import React, { useEffect, useState } from "react";
import Package from "../../../../betonquest/Package";

interface ObjectivesListProps {
    package: Package,
    syncYaml: Function,
}

export default function objectivesList(props: ObjectivesListProps) {

    return (
        <>
            Objectives List...<br />
        </>
    );
}