import { Pair, Scalar, YAMLMap } from "yaml";

export function getScalarSourceAndRange(value: Scalar | null) {
  return [getSourceByValue(value), getScalarRangeByValue(value)] as [source: string, [offsetStart: number, offsetEnd: number, indent: number]];
}

export function getSourceByValue(value: Scalar | null) {
  switch (value?.srcToken?.type) {
    // case 'byte-order-mark':
    // case 'doc-mode':
    // case 'doc-start':
    // case 'space':
    // case 'comment':
    // case 'newline':
    // case 'directive-line':
    // case 'anchor':
    // case 'tag':
    // case 'seq-item-ind':
    // case 'explicit-key-ind':
    // case 'map-value-ind':
    // case 'flow-map-start':
    // case 'flow-map-end':
    // case 'flow-seq-start':
    // case 'flow-seq-end':
    // case 'flow-error-end':
    // case 'comma':
    // case 'block-scalar-header':
    // case 'error':
    // case 'directive':
    // case 'doc-end':
    // case 'alias':
    case 'scalar':
      // For un-quoted scala (string) value, get the tailing empty spaces as well
      let tailing = "";
      if (value.srcToken.end) {
        value.srcToken.end.every(s => {
          if (s.type !== "space") {
            return false;
          }
          tailing += s.source;
          return true;
        });
      }
      return value.srcToken.source + tailing;
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
export function getScalarRangeByValue(value: Scalar | null): [offsetStart: number, offsetEnd: number, indent: number] {
  let range: [number, number, number] = value?.range ? [value.range[0], value.range[1], 0] : [0, 0, 0];
  switch (value?.srcToken?.type) {
    case 'scalar':
      // For un-quoted scala (string) value, count the tailing empty spaces as well
      let tailingOffset = 0;
      if (value.srcToken.end) {
        value.srcToken.end.every(s => {
          if (s.type !== "space") {
            return false;
          }
          tailingOffset += s.source.length;
          return true;
        });
      }
      range[1] += tailingOffset;
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
            range[0] = lastProp.offset + lastProp.source.length;
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

// Get indent / leading spaces size
export function getIndent(yml: YAMLMap | Scalar) {
  switch (yml.srcToken?.type) {
    case 'scalar':
    case 'single-quoted-scalar':
    case 'double-quoted-scalar':
    case 'block-scalar':
    case 'block-map':
      return yml.srcToken.indent;
  }
  return 0;
}

// Type guard function to check if the value is a Scalar<string>
export function isStringScalar(value: any): value is Scalar<string> {
  return value instanceof Scalar && typeof value.value === 'string';
}

export function isStringScalarPair(value: any): value is Pair<Scalar<string>, Scalar<string>> {
  return value instanceof Pair &&
    value.key instanceof Scalar && typeof value.key.value === 'string' &&
    value.value instanceof Scalar && typeof value.value.value === 'string';
}

export function isYamlMapPair<ValueType extends YAMLMap>(value: any): value is Pair<Scalar<string>, ValueType> {
  return value instanceof Pair &&
    value.key instanceof Scalar && typeof value.key.value === 'string' &&
    value.value instanceof YAMLMap;
}
