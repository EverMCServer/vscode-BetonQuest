import { ElementKind } from "betonquest-utils/betonquest/v1/Element";
import Objective from "betonquest-utils/betonquest/Objective";
import { ObjectiveKindType, Node } from "../../node";
import { ObjectiveEntry } from "./ObjectiveEntry";
import { HoverInfo } from "../../../utils/hover";

export class ObjectiveKind implements Node<ObjectiveKindType> {
  type: ObjectiveKindType = "ObjectiveKind";
  uri?: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent?: ObjectiveEntry;

  value: string;
  kindConfig?: ElementKind<Objective>;

  constructor(value: string, range: [number?, number?], kindConfig?: ElementKind<Objective>, parent?: ObjectiveEntry) {
    this.uri = parent?.uri;
    this.offsetStart = range[0];
    this.offsetEnd = range[1];
    this.parent = parent;

    this.value = value;
    this.kindConfig = kindConfig;
  }

  getHoverInfo(uri: string, offset: number): HoverInfo[] {
    const infos: HoverInfo[] = [];
    if (this.offsetStart !== undefined && this.offsetEnd !== undefined && this.offsetStart <= offset && this.offsetEnd >= offset) {
      const info: HoverInfo = {
        content: "",
        offset: [this.offsetStart, this.offsetEnd]
      };
      if (this.kindConfig) {
        info.content = "(objective) " + this.kindConfig?.value;
        if (this.kindConfig.description) {
          info.content += "\n\n---\n\n" + this.kindConfig.display.toString() + "\n\n" + this.kindConfig.description;
        }
      }
      infos.push(info);
    }
    return infos;
  }
}