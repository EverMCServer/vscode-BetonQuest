import { format, parse } from "url";

export function getParentUrl(url: string) {
  return formatUrl(url, {
    removeFilename: true,
    removeQuery: true,
  });
}

export function getBaseUrl(uri: string) {
  return formatUrl(uri, {
    removeQuery: true,
  });
}

export function formatUrl(url: string, options?: {
  removeDoubleSlashes?: boolean;
  removeFilename?: boolean;
  removeQuery?: boolean;
}) {
  const u = parse(url, true, true);
  if (options?.removeDoubleSlashes) {
    u.pathname = u.pathname?.replace("//", "/") ?? null; // Remove double slashes
    u.pathname = u.pathname?.replace("\\\\", "\\") ?? null; // Remove double slashes
  }
  if (options?.removeFilename) {
    u.pathname = u.pathname?.split('/').slice(0, -1).join('/') + '/'; // Remove filename
  }
  if (options?.removeQuery) {
    u.query = {}; // Remove query
  }
  return format(u);
}
