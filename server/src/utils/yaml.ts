import { Scalar } from "yaml";
import { Token } from "yaml/dist/parse/cst";

// export function getScalarSourceAndRange (value: Scalar<string> | null) {
//   return [getSourceByToken(value?.srcToken), getScalarRangeByValue(value)];
// }

// export function getSourceByToken(token?: Token) {
//   switch (token?.type) {
//     case 'byte-order-mark':
//     case 'doc-mode':
//     case 'doc-start':
//     case 'space':
//     case 'comment':
//     case 'newline':
//     case 'directive-line':
//     case 'anchor':
//     case 'tag':
//     case 'seq-item-ind':
//     case 'explicit-key-ind':
//     case 'map-value-ind':
//     case 'flow-map-start':
//     case 'flow-map-end':
//     case 'flow-seq-start':
//     case 'flow-seq-end':
//     case 'flow-error-end':
//     case 'comma':
//     case 'block-scalar-header':
//     case 'error':
//     case 'directive':
//     case 'doc-end':
//     case 'alias':
//     case 'scalar':
//     case 'single-quoted-scalar':
//     case 'double-quoted-scalar':
//     case 'block-scalar':
//       return token.source;
//     default:
//       return undefined;
//   }
// }

export function getScalarRangeByValue(value: Scalar<string> | null) {
  let range = value?.range ?? [0, 0, 0];
  switch (value?.srcToken?.type) {
    case 'scalar':
      break;
    case 'single-quoted-scalar':
    case 'double-quoted-scalar':
      // Remove quotes from range
      range[0] = range[0] + 1;
      range[1] = range[1] - 1;
      break;
    case 'block-scalar':
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
            const indentValueMatched = /[ \n\r]+(?=[^ \n\r])/s.exec(value.srcToken.source);
            if (indentValueMatched) {
              offset += indentValueMatched[0].length;
            }
            range[0] = lastProp.offset + lastProp.source.length + offset;
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
