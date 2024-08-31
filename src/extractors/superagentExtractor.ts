import * as t from '@babel/types';
import { extractUrl, extractRequestBody } from '../utils/astUtils';

export function isSuperagentCall(node: t.CallExpression): boolean {
  return (
    t.isCallExpression(node) &&
    t.isMemberExpression(node.callee) &&
    t.isIdentifier(node.callee.object) &&
    node.callee.object.name === 'superagent'
  );
}

export function extractSuperagentCall(
  node: t.CallExpression | any,
  exportedFunction: any
): { method: string; url: string; body: any } {
  const method = node.callee.property.name.toUpperCase();
  const url = extractUrl(node.arguments[0]);
  let body: any = null;
  if (['POST', 'PUT', 'PATCH'].includes(method) && node.arguments[1]) {
    body = extractRequestBody(node.arguments[1], exportedFunction);
  }
  return { method, url, body };
}
