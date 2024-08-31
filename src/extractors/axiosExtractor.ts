import * as t from '@babel/types';
import { extractUrl, extractRequestBody } from '../utils/astUtils';
import { globalContext } from '../context/global';

export function isAxiosCall(node: t.CallExpression): boolean {
  return (
    t.isMemberExpression(node.callee) &&
    (isAxiosMethod(node.callee) || isCustomAxiosInstance(node.callee.object))
  );
}

export function extractAxiosCall(
  node: t.CallExpression | any,
  exportedFunction: any
): { method: string; url: string; body: any } {
  const method = node.callee.property.name.toUpperCase();
  const url = extractUrl(node.arguments[0], getBaseURL(node.callee.object));
  let body: any = null;
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    body = extractRequestBody(node.arguments[1], exportedFunction);
  }
  return { method, url, body };
}

function isAxiosMethod(callee: t.MemberExpression): boolean {
  return t.isIdentifier(callee.object) && callee.object.name === 'axios';
}

function isCustomAxiosInstance(object: t.Expression): boolean {
  return (
    t.isIdentifier(object) && globalContext.axiosInstances.has(object.name)
  );
}

function getBaseURL(object: t.Expression): string {
  return t.isIdentifier(object)
    ? globalContext.axiosInstances.get(object.name) || ''
    : '';
}
