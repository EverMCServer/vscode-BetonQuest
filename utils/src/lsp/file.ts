export type FileTreeParams = { uriString: string, recursive?: boolean, patten?: string };
// export type FileTreeResponse = string[];
// export type FilesParams = FileTreeResponse;
export type FilesResponse = [uri: string, content: string][];
