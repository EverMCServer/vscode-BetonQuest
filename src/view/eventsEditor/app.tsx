import * as React from "react";
import { vscode } from "./vscode";
import Package from "../../betonquest/Package";

// locale
import L from '../../i18n/i18n';

export default function app() {

    // Get initial content data from vscode
    const [yml, setYml] = React.useState("");

    // Caching rendered Yaml, prevent unnecessary rendering
    let cachedYml = "";

    // // Method to sync document into vscode.
    // const updateDocument = (doc: string) => {
    //     vscode.postMessage({
    //       type: "edit",
    //       content: doc,
    //     });
    //     cachedYml = doc;
    // };

    // Get document's content update from vscode
    React.useEffect(()=>{
        // notify vscode when webview startup completed.
        vscode.postMessage({
            type: "webview-lifecycle",
            content: "started",
        });
        // Listen from extension message (document update etc)
        window.addEventListener('message', event => {
            const message = event.data; // JSON

            switch (message.type) {
                case 'update':
                    if (message.content.replace(/\r\n?/g, "\n") !== cachedYml.replace(/\r\n?/g, "\n")) { // Avoid duplicated update
                        console.log("update yml ...");
                        setYml(message.content);
                        cachedYml = message.content;
                        break;
                    }
                    console.log("update yml ... nothing changed.");
                    break;
            }
        });
    }, []);

    // Test i18n
    console.log(L("1"));

    // test bq model
    const pkg = new Package(`
events:
  teleportPlayer: "..."
  # ...

conditions:
  hasDiamondArmor: "..."

objectives:
  killCrepper: "..."

items:
  legendarySword: "..."

conversations:
  bobsConversation:
    quester: Bob
    first: asdf, fdsa
    NPC_options:
      a:
        text: 
          en: asdf
`);
    // console.log(pkg);
    // const ev = pkg.createEvent("a");
    // ev.setKind("asaaa");
    // console.log(pkg.getEvent("a"));
    // pkg.newConversation("new_NPC");
    // pkg.reloadYaml();
    // ev.setKind("b");
    // console.log(pkg);
    pkg.removeEvent("teleportPlayer");

    const conv = pkg.getConversation("bobsConversation");
    console.log("is conv bobsConversation multilingual?", conv?.isMultilingual());
    // console.log("debug:", pkg.getListFromArray(Event, new Pair(new Scalar("key1"), new Scalar("valule1"))));
    // console.log("debug:", pkg.getListFromArray<Event>(new Pair("key1", "valule1")));

    // const item = pkg.getItem("legendarySword");
    // console.log(item);
    // item?.setKind("1111");
    // item?.setOptions(["asdf", "asdfd"]);
    // console.log(pkg);
    // const items = pkg.getAllItems();
    // console.log(items);

    return (
        <>
        <h1>Hello, World!</h1>
        <div>{"hi form tsx"}</div>
        <div>{yml}</div>
        </>
    );
}
