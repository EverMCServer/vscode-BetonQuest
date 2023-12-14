import React from "react";
import TextArea from "antd/es/input/TextArea";
import { InputProps } from "./Common";

export default function (props: InputProps) {
    return (
        <>
            {(props.value as string[])?.map((value, index) =>
                <TextArea
                    key={index}
                    value={value}
                    onChange={(e) => {
                        // if (e.target.value.includes("\n")) {
                        //     return;
                        // }
                        let valueUpdate = props.value as string[];
                        valueUpdate[index] = e.target.value;
                        props.onChange(valueUpdate);
                    }}
                    placeholder={props.placeholder}
                    autoSize={{ minRows: props.config?.minRows || 2, maxRows: props.config?.maxRows || 6 }}
                    size="small"
                />
            )}
        </>
    );
}