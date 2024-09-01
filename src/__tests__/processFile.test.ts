import { processFile } from '../utils/fileUtils';
import { initializeGlobalContext } from '../context/global';
import { PostmanCollection } from '../generatePostmanCollection';
import fs from 'fs';

jest.mock('fs');

describe('processFile', () => {
  let collection: PostmanCollection;

  beforeEach(() => {
    initializeGlobalContext({
      include: undefined,
      exclude: undefined,
      output: undefined,
    });

    collection = {
      info: {
        name: 'Test Collection',
        schema:
          'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      },
      item: [],
    };
  });

  it('should add an API call to the Postman collection', () => {
    const mockFileContent = `
      export const fetchData = async () => {
        const response = await fetch('/api/data');
        return response.json();
      };
    `;

    (fs.readFileSync as jest.Mock).mockReturnValue(mockFileContent);

    processFile('mockFile.ts', collection);

    expect(collection.item.length).toBe(1);
    expect(collection.item[0].name).toBe('GET /api/data');
  });

  it('should handle files with no API calls', () => {
    const mockFileContent = `
      const noApiCallHere = () => {
        console.log('Just a regular function');
      };
    `;

    (fs.readFileSync as jest.Mock).mockReturnValue(mockFileContent);

    processFile('mockFile.ts', collection);

    expect(collection.item.length).toBe(0);
  });
});
