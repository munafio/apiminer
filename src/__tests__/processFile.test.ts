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

  it('should respect verbose option and log details', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    initializeGlobalContext({
      include: undefined,
      exclude: undefined,
      output: undefined,
    });

    const mockFileContent = `
      export const fetchData = async () => {
        const response = await fetch('/api/data');
        return response.json();
      };
    `;

    (fs.readFileSync as jest.Mock).mockReturnValue(mockFileContent);

    processFile('mockFile.ts', collection);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Processing file: mockFile.ts')
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Found API call: GET /api/data')
    );

    consoleSpy.mockRestore();
  });
});
