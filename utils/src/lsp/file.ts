export type FileTreeParams = { uriString: string, recursive?: boolean, pattern?: string };
// export type FileTreeResponse = string[];
// export type FilesParams = FileTreeResponse;
export type FilesResponse = [uri: string, content: string][];

export type LocationsParams = {
  /**
   * The URI of the document to begin searching locations from. It is used to determine the package to search in.
   */
  sourceUri: string,
  // /**
  //  * The component to search for. For v1 "@conditions", "@events", etc.
  //  */
  // component?: string,
  /**
   * The abstract YAML path to search for.
   */
  yamlPath: string[],
  /**
   * The package path to search for.
   */
  packagePath?: string,
};
export type LocationsResponse = {
  /**
   * The URI of the document where the location was found.
   */
  uri: string,
  /**
   * The offset of the location in the document.
   */
  offset?: number
}[];
