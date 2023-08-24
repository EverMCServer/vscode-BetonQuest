import YAML, { Document, Node, Pair, Scalar, YAMLMap, YAMLSeq } from 'yaml';

// Get yaml path by an offset number
// export default function findYamlNodeByOffset(node: YAML.YAMLMap, offset: number): string[]|null {
//     // Path to return
//     let path: string[] = [];

//     if (node.range && offset >= node.range[0] && offset <= node.range[1]) {
//         // it is within range


//     }
//     // if not within range, return false;
//     return null;
// }

// const findPaths = (pos: Number, node: YAMLMap|YAMLSeq|Scalar): string[] => {
//     if (item)
//     for (let item of node.items) {
//         if (item.value instanceof YAMLMap || item.value instanceof YAMLSeq) {
//             let paths = findPaths(pos, item.value);
//             if (paths.length > 0) {
//                 return [item.key.value, ...findPaths(pos, item.value)];
//             }
//         }
//     }
//         } else if (item instanceof Pair) {
//             let paths = findPaths(pos, item);
//             if (paths.length > 0) {
//                 return paths;
//             }
//         }

//         if ((item.key?.value) && ((pos >= item.value.range[0] - 1 && pos <= item.value.range[item.value.range.length - 1]) ||
//             (pos >= item.key.range[0] && pos <= item.key.range[item.key.range.length - 1]))) {
//             return [item.key.value as string];
//         }
//     }
//     return [];
// }

export default function findYamlNodeByOffset (offset: number, yaml: string): string[] {
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
