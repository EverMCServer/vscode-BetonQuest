import { ElementKind } from "betonquest-utils/betonquest/v1/Element";
import Condition from "betonquest-utils/betonquest/Condition";
import { ConditionKindType, Node } from "../../node";
import { ConditionEntry } from "./ConditionEntry";
import { HoverInfo } from "../../../utils/hover";

export class ConditionKind implements Node<ConditionKindType> {
  type: ConditionKindType = "ConditionKind";
  uri?: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent?: ConditionEntry;

  value: string;
  kindConfig?: ElementKind<Condition>;

  constructor(value: string, range: [number?, number?], kindConfig?: ElementKind<Condition>, parent?: ConditionEntry) {
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
        info.content = "(condition) " + this.kindConfig?.value;
        if (this.kindConfig.description) {
          info.content += "\n\n---\n\n" + this.kindConfig.display.toString() + "\n\n" + this.kindConfig.description;
        }
      }
      infos.push(info);
    }
    return infos;
  }
}