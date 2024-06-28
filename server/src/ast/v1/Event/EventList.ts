import { TextDocument } from "vscode-languageserver-textdocument";
import { Scalar, isPair, isScalar } from "yaml";

import { LocationsResponse } from "betonquest-utils/lsp/file";
import { EventListType } from "../../node";
import { PackageV1 } from "../Package";
import { Document } from "../document";
import { EventEntry } from "./EventEntry";
import { EventKey } from "./EventKey";

export class EventList extends Document<EventListType> {
  readonly type: EventListType = "EventList";

  constructor(uri: string, document: TextDocument, parent: PackageV1) {
    super(uri, document, parent);

    // Parse Elements
    this.yml.items.forEach(pair => {
      if (isScalar<string>(pair.value) && isPair<Scalar<string>, Scalar<string>>(pair)) {
        this.addChild(new EventEntry(pair, this));
      } else {
        // TODO: Add diagnostic
      }
    });
  }

  getLocations(yamlPath: string[], sourceUri: string) {
    const result: LocationsResponse = [];
    this
      .getChildren<EventEntry>('EventEntry')
      .flatMap(e => e.getChildren<EventKey>('EventKey', k => k.value === yamlPath[1]))
      .forEach(k => {
        result.push({
          uri: this.uri,
          offset: k.offsetStart
        });
      });
    return result;
  }

  getEventEntries(id: string, packageUri: string): EventEntry[] { // TODO: optimize let packageUri be optional
    if (this.parent.isPackageUri(packageUri)) {
      return this.getChildren<EventEntry>('EventEntry', e => e.getChild<EventKey>('EventKey')?.value === id);
    } else {
      return this.parent.getEventEntries(id, packageUri);
    }
  }

}
