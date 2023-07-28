import * as React from "react";

interface TestViewProps {
    yml: string;
}

export default function testView({yml} : TestViewProps) {
    // debug
    console.log("re-rendering view...");

    return (
        <div>
            <div>A TestView here.</div>
            <div>{yml}</div>
        </div>
    );
}
