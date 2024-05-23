export type LocationLinkOffset = {
  originSelectionRange?: [start: number, end: number];
  targetUri: string;
  targetRange: [start: number, end: number];
  targetSelectionRange: [start: number, end: number];
};