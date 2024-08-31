import fs from 'fs';
import path from 'path';
import kleur from 'kleur';

import { processFile } from './utils/fileUtils';
import { globalContext } from './context/global';

interface CollectionItem {
  name: string;
  request: {
    method: string;
    url: any;
    body?: {
      mode: string;
      raw: string;
    };
  };
}

export interface PostmanCollection {
  info: {
    name: string;
    schema: string;
  };
  item: CollectionItem[];
}

export function generatePostmanCollection(
  directory: string
): PostmanCollection {
  const collection: PostmanCollection = {
    info: {
      name: 'API Collection',
      schema:
        'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    item: [],
  };

  function shouldProcessFile(filePath: string): boolean {
    const { include, exclude } = globalContext.options;
    const includePattern = include ? new RegExp(include) : null;
    const excludePattern = exclude ? new RegExp(exclude) : null;

    if (includePattern && !includePattern.test(filePath)) {
      return false;
    }

    if (excludePattern && excludePattern.test(filePath)) {
      return false;
    }

    return true;
  }

  function traverseDirectory(dir: string): void {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        traverseDirectory(fullPath);
      } else if (
        shouldProcessFile(fullPath) &&
        (file.endsWith('.js') ||
          file.endsWith('.jsx') ||
          file.endsWith('.ts') ||
          file.endsWith('.tsx'))
      ) {
        try {
          processFile(fullPath, collection);
        } catch (error) {
          console.error(
            kleur.red(
              `Error processing file ${fullPath}: ${(error as Error).message}`
            )
          );
        }
      }
    }
  }

  console.log(kleur.yellow(`Starting to scan directory: ${directory}`));

  traverseDirectory(directory);

  console.log(kleur.green('Scanning complete.'));

  return collection;
}
