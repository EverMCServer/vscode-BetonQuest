import { Scalar, YAMLMap, parseDocument } from "yaml";
import { EventListType, Node } from "../../node";
import { EventEntry } from "./EventEntry";
import { PackageV1 } from "../../Package";


export class EventList implements Node<EventListType> {
  type: "EventList" = "EventList";
  uri?: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent?: PackageV1;

  // Cache the parsed yaml document
  yml?: YAMLMap<Scalar<string>, Scalar<string>>;
  entries: EventEntry[] = [];

  constructor(uri: string, fileContent: string, parent?: PackageV1) {
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
    this.offsetStart = this.yml.range?.[0];
    this.offsetEnd = this.yml.range?.[1];

    // Parse Elements
    this.yml.items.forEach(pair => {
      this.entries.push(new EventEntry(pair, this));
    });
  }
}
