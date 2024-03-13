import * as React from "react";
import { ArgumentsPatterns } from "../Arguments";
import ListElement from "../ListElement";

export type ElementKind<T extends ListElement> = {
  value: string,
  display: string,
  description: React.ReactNode,
  argumentsPattern: ArgumentsPatterns
};
