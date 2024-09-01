import * as t from '@babel/types';
import { extractUrl, extractRequestBody } from '../utils/astUtils';

export function isGotCall(node: t.CallExpression): boolean {
  return (
    t.isCallExpression(node) &&
    t.isIdentifier(node.callee) &&
    node.callee.name === 'got'
  );
}

export function extractGotCall(
  node: t.CallExpression | any,
  exportedFunction: any
): { method: string; url: string; body: any } {
  let method = 'GET';
  const url = extractUrl(node.arguments[0]);
  let body: any = null;
  if (node.arguments[1] && t.isObjectExpression(node.arguments[1])) {
    const methodProp: any = node.arguments[1].properties.find(
      (prop: any) => t.isIdentifier(prop.key) && prop.key.name === 'method'
    );
    if (methodProp && t.isStringLiteral(methodProp.value)) {
      method = methodProp.value.value.toUpperCase();
    }
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      const bodyProp: any = node.arguments[1].properties.find(
        (prop: any) =>
          t.isIdentifier(prop.key) &&
          (prop.key.name === 'body' || prop.key.name === 'json')
      );
      if (bodyProp) {
        body = extractRequestBody(bodyProp.value, exportedFunction);
      }
    }
  }
  return { method, url, body };
}
