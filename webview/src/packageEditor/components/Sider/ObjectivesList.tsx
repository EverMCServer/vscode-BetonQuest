import React from "react";

import Objective from "betonquest-utils/betonquest/Objective";
import ObjectivesEditor from "./ObjectivesList/ObjectivesEditor";
import CommonList, { BaseListProps } from "./CommonList";

export default function objectivesList(props: BaseListProps) {

    return (
        <>
           <CommonList<Objective> {...props} type='objectives' editor={ObjectivesEditor} />
        </>
    );
}