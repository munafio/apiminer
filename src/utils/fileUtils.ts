import fs from 'fs';
import * as parser from '@babel/parser';
import kleur from 'kleur';
import {
  extractApiCall,
  addRequestToCollection,
  extractInterfaceBody,
  extractBaseURL,
  isAxiosInstanceCreation,
} from './astUtils';
import { PostmanCollection } from '../generatePostmanCollection';
import { globalContext } from '../context/global';
import babelTraverse from '@babel/traverse';

const traverse =
  ((babelTraverse as any).default as typeof babelTraverse) || babelTraverse;

export function processFile(
  filePath: string,
  collection: PostmanCollection
): void {
  console.log(kleur.cyan(`\nProcessing file: ${filePath}`));

  const content = fs.readFileSync(filePath, 'utf-8');
  const ast = parser.parse(content, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript', 'classProperties', 'decorators-legacy'],
  });

  let exportedFunction: any = null;

  traverse(ast, {
    ExportNamedDeclaration(path: any) {
      if (path.node.declaration && path.node.declaration.declarations) {
        const declarator = path.node.declaration.declarations[0];
        if (
          declarator &&
          declarator.init &&
          declarator.init.type === 'ArrowFunctionExpression'
        ) {
          exportedFunction = declarator.init;
        }
      }
    },
    ImportDeclaration(path) {
      const source = path.node.source.value;
      path.node.specifiers.forEach((specifier) => {
        if (specifier.type === 'ImportDefaultSpecifier') {
          globalContext.importedModules.set(specifier.local.name, source);
        }
      });
    },
    VariableDeclarator(path: any) {
      if (path.node.id.type === 'Identifier') {
        globalContext.declaredVariables.set(path.node.id.name, path.node.init);
      }
      if (isAxiosInstanceCreation(path.node)) {
        const instanceName = path.node.id.name;
        const baseURL = extractBaseURL(path.node.init as any);
        if (baseURL) {
          globalContext.axiosInstances.set(instanceName, baseURL);
        }
      }
    },
    TSInterfaceDeclaration(path) {
      const interfaceName = path.node.id.name;
      const interfaceBody = extractInterfaceBody(path.node);
      globalContext.typeInterfaces.set(interfaceName, interfaceBody);
    },
    CallExpression(path) {
      const { method, url, body } = extractApiCall(path.node, exportedFunction);
      if (method && url) {
        console.log(kleur.blue(`Found API call: ${method} ${url}`));
        addRequestToCollection(collection, method, url, body);
      }
    },
  });
}
