import * as t from '@babel/types';
import { extractUrl, extractRequestBody } from '../utils/astUtils';

export function isRequestCall(node: t.CallExpression): boolean {
  return (
    t.isCallExpression(node) &&
    t.isIdentifier(node.callee) &&
    node.callee.name === 'request'
  );
}

export function extractRequestCall(
  node: t.CallExpression | any,
  exportedFunction: any
): { method: string; url: string; body: any } {
  let method = 'GET';
  let url = '';
  let body: any = null;
  if (t.isObjectExpression(node.arguments[0])) {
    const urlProp: any = node.arguments[0].properties.find(
      (prop: any) => t.isIdentifier(prop.key) && prop.key.name === 'url'
    );
    if (urlProp) {
      url = extractUrl(urlProp.value);
    }
    const methodProp: any = node.arguments[0].properties.find(
      (prop: any) => t.isIdentifier(prop.key) && prop.key.name === 'method'
    );
    if (methodProp && t.isStringLiteral(methodProp.value)) {
      method = methodProp.value.value.toUpperCase();
    }
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      const bodyProp: any = node.arguments[0].properties.find(
        (prop: any) =>
          t.isIdentifier(prop.key) &&
          (prop.key.name === 'body' || prop.key.name === 'json')
      );
      if (bodyProp) {
        body = extractRequestBody(bodyProp.value, exportedFunction);
      }
    }
  } else {
    url = extractUrl(node.arguments[0]);
  }
  return { method, url, body };
}
