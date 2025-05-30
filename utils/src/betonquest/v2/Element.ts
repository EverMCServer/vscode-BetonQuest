import * as React from "react";
import { ArgumentsPatterns, ArgumentType } from "../Arguments";
import ListElement from "../ListElement";

export type ElementKind<T extends ListElement> = {
  value: string,
  display: string,
  description: React.ReactNode,
  argumentsPatterns: ArgumentsPatterns,
  variableProperties?: VariableProperties[]
};

type VariableProperties = {
  name: string,
  type: ArgumentType,
  description: string
};
