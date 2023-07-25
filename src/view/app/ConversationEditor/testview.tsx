import * as React from "react";

export default function testView() {
    // debug
    console.log("hi");

    const [doc, setDoc] = React.useState("");

    React.useEffect(()=>{
        // listen from extension message (document update etc)
        window.addEventListener('message', event => {
            const message = event.data; // JSON

            switch (message.type) {
                case 'update':
                    setDoc(message.text);
            }
        });
    }, []);

    return (
        <div>
            <div>A TestView here.</div>
            <div>{doc}</div>
        </div>
    );
}
