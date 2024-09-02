import * as t from '@babel/types';
import {
  isAxiosCall,
  isFetchCall,
  isGotCall,
  isRequestCall,
  isSuperagentCall,
  isNodeFetchCall,
  extractAxiosCall,
  extractFetchCall,
  extractGotCall,
  extractRequestCall,
  extractSuperagentCall,
  extractNodeFetchCall,
} from '../extractors';
import { globalContext } from '../context/global';

export interface PostmanRequest {
  name: string;
  request: {
    method: string;
    url: any;
    body?: {
      mode: string;
      raw: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
  [key: string]: any;
}

// Utility function to check if a node is creating an Axios instance
export function isAxiosInstanceCreation(node: t.VariableDeclarator): boolean {
  return (
    t.isCallExpression(node.init) &&
    t.isMemberExpression(node.init.callee) &&
    t.isIdentifier(node.init.callee.object) &&
    node.init.callee.object.name === 'axios' &&
    t.isIdentifier(node.init.callee.property) &&
    node.init.callee.property.name === 'create'
  );
}

// Extract the baseURL from an Axios instance creation
export function extractBaseURL(node: t.CallExpression): string | null {
  if (t.isObjectExpression(node.arguments[0])) {
    const baseURLProp = node.arguments[0].properties.find(
      (prop): prop is t.ObjectProperty =>
        t.isObjectProperty(prop) &&
        t.isIdentifier(prop.key) &&
        prop.key.name === 'baseURL'
    );
    if (baseURLProp && t.isStringLiteral(baseURLProp.value)) {
      return baseURLProp.value.value;
    }
  }
  return null;
}

// Extracts the body of a TypeScript interface
export function extractInterfaceBody(
  interfaceNode: t.TSInterfaceDeclaration
): Record<string, string> {
  const body: Record<string, string> = {};
  interfaceNode.body.body.forEach((property) => {
    if (t.isTSPropertySignature(property) && t.isIdentifier(property.key)) {
      body[property.key.name] = getTSTypeAnnotation(
        property.typeAnnotation?.typeAnnotation
      );
    }
  });
  return body;
}

// Converts a TypeScript annotation to a string representation
export function getTSTypeAnnotation(typeAnnotation?: t.TSType): string {
  if (t.isTSStringKeyword(typeAnnotation)) return 'string';
  if (t.isTSNumberKeyword(typeAnnotation)) return 'number';
  if (t.isTSBooleanKeyword(typeAnnotation)) return 'boolean';
  if (t.isTSArrayType(typeAnnotation))
    return `${getTSTypeAnnotation(typeAnnotation.elementType)}[]`;
  if (t.isTSUnionType(typeAnnotation)) {
    return typeAnnotation.types
      .map((type) => getTSTypeAnnotation(type))
      .join(' | ');
  }
  return 'any';
}

// Extracts the API call information from a node
export function extractApiCall(
  node: t.CallExpression,
  exportedFunction: t.ArrowFunctionExpression | null
): { method: string | null; url: string | null; body: any | null } {
  if (isAxiosCall(node)) {
    return extractAxiosCall(node, exportedFunction);
  } else if (isFetchCall(node)) {
    return extractFetchCall(node, exportedFunction);
  } else if (isGotCall(node)) {
    return extractGotCall(node, exportedFunction);
  } else if (isRequestCall(node)) {
    return extractRequestCall(node, exportedFunction);
  } else if (isSuperagentCall(node)) {
    return extractSuperagentCall(node, exportedFunction);
  } else if (isNodeFetchCall(node)) {
    return extractNodeFetchCall(node, exportedFunction);
  }
  return { method: null, url: null, body: null };
}

// Resolves a URL from a node
export function extractUrl(node: t.Expression, baseURL = ''): string {
  if (t.isStringLiteral(node)) {
    return baseURL + node.value;
  } else if (t.isTemplateLiteral(node)) {
    let url = baseURL;
    node.quasis.forEach((quasi, index) => {
      url += quasi.value.raw;
      if (index < node.expressions.length) {
        url += resolveExpression(node.expressions[index] as any);
      }
    });
    return url;
  } else if (t.isBinaryExpression(node) && node.operator === '+') {
    return extractUrl(node.left as any, baseURL) + extractUrl(node.right);
  } else if (t.isIdentifier(node)) {
    return baseURL + resolveVariable(node.name as any);
  }
  return baseURL + '<dynamic_url>';
}

// Resolves an expression to a string value
export function resolveExpression(node: t.Expression): string {
  if (t.isIdentifier(node)) {
    return resolveVariable(node.name);
  } else if (t.isMemberExpression(node)) {
    if (t.isIdentifier(node.object) && t.isIdentifier(node.property)) {
      return `${node.object.name}.${node.property.name}`;
    }
  }
  return '<dynamic_value>';
}

// Resolves a variable name to its value if declared
export function resolveVariable(name: string): string {
  const value = globalContext.declaredVariables.get(name);
  if (t.isStringLiteral(value)) {
    return value.value;
  } else if (t.isTemplateLiteral(value)) {
    return extractUrl(value);
  } else if (t.isObjectExpression(value)) {
    return '[Object]';
  }
  return name;
}

// Extracts the request body for API calls that have a body
export function extractRequestBody(
  node: t.Expression,
  exportedFunction: t.ArrowFunctionExpression | null
): any {
  if (t.isIdentifier(node) && exportedFunction) {
    const params = exportedFunction.params;
    const bodyParam = params.find(
      (p) => t.isIdentifier(p) && p.name === node.name
    );
    if (bodyParam && t.isTSTypeAnnotation(bodyParam.typeAnnotation)) {
      const typeName = (
        bodyParam.typeAnnotation.typeAnnotation as t.TSTypeReference
      )?.typeName as t.Identifier;
      const interfaceBody = globalContext.typeInterfaces.get(typeName.name);
      if (interfaceBody) {
        return generateExampleFromInterface(interfaceBody);
      }
    }
  }
  return null;
}

// Generates an example value from a TypeScript interface
export function generateExampleFromInterface(
  interfaceBody: Record<string, string>
): Record<string, any> {
  const example: Record<string, any> = {};
  for (const [key, type] of Object.entries(interfaceBody)) {
    example[key] = generateExampleValue(type);
  }
  return example;
}

// Generates an example value based on the TypeScript type
export function generateExampleValue(type: string): any {
  switch (type) {
    case 'string':
      return 'example_string';
    case 'number':
      return 0;
    case 'boolean':
      return true;
    case 'number | string':
      return '0 or example_string';
    default:
      if (type.endsWith('[]')) return [generateExampleValue(type.slice(0, -2))];
      if (type.includes('|'))
        return generateExampleValue(type.split('|')[0].trim());
      return null;
  }
}

// Adds a request to the Postman collection
export function addRequestToCollection(
  collection: any,
  method: string,
  url: string,
  body: any
): void {
  const request: PostmanRequest = {
    name: `${method} ${url}`,
    request: {
      method: method,
      url: parseUrl(url),
    },
  };

  if (body) {
    request.request.body = {
      mode: 'raw',
      raw: JSON.stringify(body, null, 2),
      options: {
        raw: {
          language: 'json',
        },
      },
    };
  }

  collection.item.push(request);
}

// Parses a URL into Postman's URL object format
export function parseUrl(url: string): any {
  const parsedUrl: any = {
    raw: url,
    path: [],
    query: [],
  };

  const [pathPart, queryPart] = url.split('?');
  parsedUrl.path = pathPart.split('/').filter(Boolean);

  if (queryPart) {
    parsedUrl.query = queryPart.split('&').map((param) => {
      const [key, value] = param.split('=');
      return { key, value: value || '' };
    });
  }

  if (url.startsWith('http')) {
    const [protocol, rest] = url.split('://');
    parsedUrl.protocol = protocol;
    const [host, ...pathParts] = rest.split('/');
    parsedUrl.host = host.split('.');
    parsedUrl.path = pathParts;
  }

  return parsedUrl;
}
