import { isFetchCall, extractFetchCall } from './fetchExtractor';

export function isNodeFetchCall(node: any): boolean {
  return isFetchCall(node);
}

export function extractNodeFetchCall(
  node: any,
  exportedFunction: any
): { method: string; url: string; body: any } {
  return extractFetchCall(node, exportedFunction);
}
