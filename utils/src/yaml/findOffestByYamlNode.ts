import * as YAML from "yaml";
import { Document, Node, Pair, Scalar, YAMLMap, YAMLSeq } from 'yaml';

export default function findOffestByYamlNode(path: string[], yaml: string): number {
    return findOffestByYamlMapNode(path, YAML.parseDocument(yaml).contents as YAMLMap | YAMLSeq | Scalar);
}

function findOffestByYamlMapNode(path: string[], node: YAMLMap | YAMLSeq | Scalar): number {
    if (node instanceof Scalar || node instanceof YAMLSeq) {
        return node.range![0];
    }
    for (const item of node.items) {
        if (item instanceof YAMLMap || item instanceof YAMLSeq) {
            continue;
        }
        if (item instanceof Pair) {
            const key = item.key as Scalar;
            const value = item.value as YAMLMap | YAMLSeq | Scalar;
            if (path[0] === key.value) {
                if (path.length > 1) {
                    return findOffestByYamlMapNode(path.slice(1), value);
                }
                return key.range![0];
            }
            continue;
        }
    }
    return node.range![0];
}
