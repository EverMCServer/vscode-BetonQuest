import { Document, Scalar, YAMLMap, parseDocument } from "yaml";
import { EventEntryType, EventListType, Node, PackageTypes } from "../../node";
import { EventEntry } from "./EventEntry";


export class EventList implements Node<EventListType> {
  type: "EventList" = "EventList";
  uri?: string;
  startOffset?: number;
  endOffset?: number;
  parent?: Node<PackageTypes>;

  // Cache the parsed yaml document
  yml?: YAMLMap<Scalar<string>, Scalar<string>>;
  entries: Node<EventEntryType>[] = [];

  constructor(uri: string, fileContent: string, parent?: Node<PackageTypes>) {
    this.uri = uri;
    this.parent = parent;

    // Parse yaml
    const yml = parseDocument<YAMLMap<Scalar<string>, Scalar<string>>, false>(
      fileContent,
      {
        keepSourceTokens: true,
        strict: false
      }
    );
    if (!(yml.contents instanceof YAMLMap)) {
      return;
    }
    this.yml = yml.contents;

    // Extract offsets
    this.startOffset = this.yml.range?.[0];
    this.endOffset = this.yml.range?.[1];

    // Parse Elements
    this.yml.items.forEach(pair => {
      this.entries.push(new EventEntry(pair, this));
    });
  }
}
