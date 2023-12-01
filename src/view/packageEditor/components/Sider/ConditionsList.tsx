import React, { useEffect, useState } from "react";

import CommonList, { BaseListProps } from "./CommonList";
import ConditionsEditor from "./ConditionsList/ConditionsEditor";

export default function conditionsList(props: BaseListProps) {

    return (
        <>
           <CommonList {...props} type='conditions' listElements={props.package.getAllConditions()} editor={ConditionsEditor} />
        </>
    );
}