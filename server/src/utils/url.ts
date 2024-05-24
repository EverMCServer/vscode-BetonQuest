import { format, parse } from "url";

export function getParentUrl(url: string) {
  return formatUrl(url, {
    removeLast: true,
    removeQuery: true,
  });
}

export function getBaseUrl(uri: string) {
  return formatUrl(uri, {
    removeQuery: true,
  });
}

export function getFilename(uri: string, excludeExtension?: boolean) {
  const u = parse(uri, true);
  return u.path?.split("/").pop()?.replace(/(\.[^/.]+)$/m, excludeExtension ? "" : "$1") ?? "";
}

export function formatUrl(url: string, options?: {
  removeDoubleSlashes?: boolean;
  removeLast?: boolean;
  removeQuery?: boolean;
}) {
  const u = parse(url, true, true);
  if (options?.removeDoubleSlashes) {
    u.pathname = u.pathname?.replace("//", "/") ?? null; // Remove double slashes
    u.pathname = u.pathname?.replace("\\\\", "\\") ?? null; // Remove double slashes
  }
  if (options?.removeLast) {
    u.pathname = u.pathname?.replace(/\/$/m, "").split('/').slice(0, -1).join('/') + '/'; // Remove the last dir / file name
  }
  if (options?.removeQuery) {
    u.query = {}; // Remove query
  }
  return format(u);
}
