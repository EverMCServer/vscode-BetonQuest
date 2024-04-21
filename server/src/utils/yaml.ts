import { Pair, Scalar, YAMLMap } from "yaml";

export function getScalarSourceAndRange (value: Scalar<string> | null) {
  return [getSourceByValue(value), getScalarRangeByValue(value)] as [string | undefined, [number, number, number]];
}

export function getSourceByValue(value: Scalar<string> | null) {
  switch (value?.srcToken?.type) {
    case 'byte-order-mark':
    case 'doc-mode':
    case 'doc-start':
    case 'space':
    case 'comment':
    case 'newline':
    case 'directive-line':
    case 'anchor':
    case 'tag':
    case 'seq-item-ind':
    case 'explicit-key-ind':
    case 'map-value-ind':
    case 'flow-map-start':
    case 'flow-map-end':
    case 'flow-seq-start':
    case 'flow-seq-end':
    case 'flow-error-end':
    case 'comma':
    case 'block-scalar-header':
    case 'error':
    case 'directive':
    case 'doc-end':
    case 'alias':
    case 'scalar':
      return value.srcToken.source;
    case 'block-scalar':
      // Remove tailing newline
      if (value.srcToken.source.endsWith("\r\n")) {
        // Windows style newline
        return value.srcToken.source.slice(0, -2);
      }
      return value.srcToken.source.slice(0, -1);
    case 'single-quoted-scalar':
    case 'double-quoted-scalar':
      // Remove quotes from range
      return value.srcToken.source.slice(1, -1);
    default:
      return value?.value;
  }
}

// Return [offsetStart, offsetEnd, indent]
export function getScalarRangeByValue(value: Scalar<string> | null) {
  let range: [number, number, number] = value?.range ? [value.range[0], value.range[1], 0]: [0, 0, 0];
  switch (value?.srcToken?.type) {
    case 'scalar':
      break;
    case 'single-quoted-scalar':
    case 'double-quoted-scalar':
      // Remove quotes from range
      range[0] += 1;
      range[1] -= 1;
      break;
    case 'block-scalar':
      // Remove tailing newline
      range[1] -= 1;
      if (value.srcToken.source.endsWith("\r\n")) {
        // Windows style newline
        range[1] -= 1;
      }
      // Get the correct starting position
      const lastProp = value.srcToken.props[value.srcToken.props.length - 1];
      if (lastProp) {
        switch (lastProp.type) {
          case 'byte-order-mark':
          case 'doc-mode':
          case 'doc-start':
          case 'space':
          case 'comment':
          case 'newline':
          case 'directive-line':
          case 'anchor':
          case 'tag':
          case 'seq-item-ind':
          case 'explicit-key-ind':
          case 'map-value-ind':
          case 'flow-map-start':
          case 'flow-map-end':
          case 'flow-seq-start':
          case 'flow-seq-end':
          case 'flow-error-end':
          case 'comma':
          case 'block-scalar-header':
          // case 'error':
          // case 'directive':
          // case 'doc-end':
          // case 'alias':
          // case 'scalar':
          // case 'single-quoted-scalar':
          // case 'double-quoted-scalar':
          // case 'block-scalar':
            // Calculate initial offset from raw source
            let offset = lastProp.indent;
            const valueOffsetMatched = /[ \n\r]+(?=[^ \n\r])/s.exec(value.srcToken.source);
            if (valueOffsetMatched) {
              offset += valueOffsetMatched[0].length;
            }
            range[0] = lastProp.offset + lastProp.source.length + offset;
            // Calculate indent of the block scalar
            let indent = lastProp.indent;
            const valueIndentMatched = /^ *(?=[^ \n\r])/sm.exec(value.srcToken.source);
            if (valueIndentMatched) {
              indent += valueIndentMatched[0].length;
            }
            range[2] = indent;
            break;
          default:
            break;
        }
      }
      break;
    default:
      break;
  }

  return range;
}

// Type guard function to check if the value is a Scalar<string>
export function isStringScalar(value: any): value is Scalar<string> {
  return value instanceof Scalar && typeof value.value === 'string';
}

export function isStringScalarPair(value: any): value is Pair<Scalar<string>, Scalar<string>> {
  return value instanceof Pair && value.value instanceof Scalar && typeof value.value.value === 'string';
}

export function isYamlmapPair(value: any): value is Pair<Scalar<string>, YAMLMap<Scalar<string>>> {
  return value instanceof Pair && value.value instanceof YAMLMap;
}
