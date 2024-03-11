/* eslint-disable @typescript-eslint/naming-convention */
import * as React from "react";

type YamlPathPointer = {
    documentPathPointer: string[],
    setDocumentPathPointer: (path: string[]) => void,
    editorPathPointer: string[],
    setEditorPathPointer: (path: string[]) => void,
};

export const YamlPathPointer = React.createContext<YamlPathPointer>({
    documentPathPointer: [],
    setDocumentPathPointer: () => {},
    editorPathPointer: [],
    setEditorPathPointer: () => {},
});

