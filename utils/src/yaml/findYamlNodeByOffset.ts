import * as YAML from "yaml";
import { Document, Node, Pair, Scalar, YAMLMap, YAMLSeq } from 'yaml';

export default function findYamlNodeByOffset(offset: number, yaml: string): string[] {
    return findYamlMapNodeByOffset(offset, YAML.parseDocument(yaml).contents as YAMLMap | YAMLSeq);
}

function findYamlMapNodeByOffset(offset: number, node: YAMLMap | YAMLSeq | Scalar): string[] {
    if (node instanceof Scalar) {
        return [];
    }
    for (let item of node.items) {
        if (item instanceof YAMLMap || item instanceof YAMLSeq) {
            let paths = findYamlMapNodeByOffset(offset, item);
            if (paths.length > 0) {
                return paths;
            }
            continue;
        }

        const key = (item as Pair).key as Scalar;
        const value = (item as Pair).value as YAMLMap | YAMLSeq | Scalar;

        if (value instanceof YAMLMap || value instanceof YAMLSeq) {
            let paths = findYamlMapNodeByOffset(offset, value);
            if (paths.length > 0) {
                paths.unshift(key.value as string);
                return paths;
            }
        }

        if (key?.value && key.range && value.range
            && ((offset <= value.range[value.range.length - 1]) &&
                (offset >= key.range[0]))) {
            return [key.value as string];
        }
    }
    return [];
}
