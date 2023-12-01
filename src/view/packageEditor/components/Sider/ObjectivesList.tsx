import React, { useEffect, useState } from "react";

import ObjectivesEditor from "./ObjectivesList/ObjectivesEditor";
import CommonList, { BaseListProps } from "./CommonList";

export default function objectivesList(props: BaseListProps) {

    return (
        <>
           <CommonList {...props} editor={ObjectivesEditor} listElements={props.package.getAllObjectives()} />
        </>
    );
}