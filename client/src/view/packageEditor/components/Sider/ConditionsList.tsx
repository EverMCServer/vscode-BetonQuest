import React from "react";

import Condition from "../../../../betonquest/Condition";
import CommonList, { BaseListProps } from "./CommonList";
import ConditionsEditor from "./ConditionsList/ConditionsEditor";

export default function conditionsList(props: BaseListProps) {

    return (
        <>
           <CommonList<Condition> {...props} type='conditions' editor={ConditionsEditor} />
        </>
    );
}