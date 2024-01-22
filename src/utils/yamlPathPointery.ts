/* eslint-disable @typescript-eslint/naming-convention */
import React from "react";

type YamlPathPointer = {
    yamlPathPointer: string[],
    setYamlPathPointer: (path: string[]) => void,
};

export const YamlPathPointer = React.createContext<YamlPathPointer>({ yamlPathPointer: [], setYamlPathPointer: () => {} });

