import * as vscode from "vscode";
import { FileTreeParams, FilesResponse } from "betonquest-utils/lsp/file";
import { ResponseError } from "vscode-languageclient";

const textDecoder = new TextDecoder();

export const fileTreeHandler =  async({ uriString, recursive = false, pattern }: FileTreeParams) => {
  try {
    let files = await vscode.workspace.fs.readDirectory(vscode.Uri.parse(uriString));
    let result = files.filter(path => path[1] === vscode.FileType.File).map(path => uriString + encodeURI('/' + path[0])).filter(path => pattern ? path.match(pattern) : true);
    // read from subfolders
    if (recursive) {
      let iterator = async (parent: string, files: [string, vscode.FileType][]) => {
        let subFolders: string[] = [];
        // search subfolders of this folder
        for (const path of files) {
          if (path[1] === vscode.FileType.Directory) {
            try {
              let u = parent + encodeURI('/' + path[0]);
              let s = await vscode.workspace.fs.readDirectory(vscode.Uri.parse(u));
              subFolders.push(...s.filter(p => p[1] === vscode.FileType.File).map(p => u + encodeURI('/' + p[0])).filter(path => pattern ? path.match(pattern) : true));
              // recursivly search subfolders of subfolders
              if (s.length > 0) {
                subFolders.push(...await iterator(u, s));
              }
            } catch (e) { }
          }
        }
        return subFolders;
      };
      result.push(...await iterator(uriString, files));
    }
    return result;
  } catch (e) {
    if (e instanceof vscode.FileSystemError) {
      switch (e.code) {
        case "FileNotFound":
        case "FileNotADirectory":
        case "Unavailable":
          return new ResponseError(404, e.message, e.code);
        case "NoPermissions":
          return new ResponseError(403, e.message, e.code);
        // case "FileExists":
        // case "FileIsADirectory":
        default:
          return new ResponseError(500, e.message, e.code);
      }
    }
  }
};

export const fileHandler = async (uriString: string) => {
  let uri = vscode.Uri.parse(uriString);
  try {
    let file = await vscode.workspace.fs.readFile(uri);
    return textDecoder.decode(file);
  } catch (e) {
    if (e instanceof vscode.FileSystemError) {
      switch (e.code) {
        case "FileNotFound":
        case "FileIsADirectory":
          return new ResponseError(404, e.message, e.code);
        case "NoPermissions":
          return new ResponseError(403, e.message, e.code);
        case "Unavailable":
          return new ResponseError(429, e.message, e.code);
        // case "FileExists":
        // case "FileNotADirectory":
        default:
          return new ResponseError(500, e.message, e.code);
      }
    }
  }
};

export const filesHandler = async (uriStrings: string[]) => {
  let files: FilesResponse = [];
  for (const uri of uriStrings) {
    try {
      files.push([uri, textDecoder.decode(await vscode.workspace.fs.readFile(vscode.Uri.parse(uri)))]);
    } catch (e) { }
  }
  return files;
};
