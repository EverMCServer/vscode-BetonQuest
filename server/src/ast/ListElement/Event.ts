import { Pair, Scalar } from "yaml";
import { Node, NodeType } from "../node";
import { ListElement } from "./ListElement";
import { ArgumentsString } from "betonquest-utils/betonquest/Arguments";

export class EventOption extends ListElement<'EventOption'> {
  startOffset?: number;
  endOffset?: number;
  children?: Node<NodeType>[];

  // name?: string
  kind?: string; // e.g. "spawn"
  argType?: string; // primitive types, 'string[]' etc
  // [key: string]: any,

  // constructor(content: string, parent?: Node<NodeType>) {
  constructor(pair: Pair<Scalar<string>, Scalar<string>>, parent?: Node<NodeType>) {
    super('EventOption', parent);

    pair.value?.srcToken; // TODO
    this.startOffset = pair.value?.range?.[0];
    this.endOffset = pair.value?.range?.[1];


    // Parse ListElement and get all pos / value / childrens
    if (!pair.value?.source) {
      return;
    }
    const content = pair.value.source;
    pair.value.type
    let [kind, str] = content.split(" ", 2);
    this.kind = kind;

    // TODO: get pattern by kind

    // Parse ArgumentsString
    const args = new ArgumentsString(str);
    args.getMandatoryArguments().forEach((arg) => {
      this.children?.push(
        { } as Node<NodeType>
      );
    });
  }

}