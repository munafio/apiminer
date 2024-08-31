import { Command } from 'commander';
import path from 'path';
import fs from 'fs';
import { generatePostmanCollection } from './generatePostmanCollection';
import { globalContext, initializeGlobalContext } from './context/global';

const program = new Command();

program
  .name('apiminer')
  .description(
    'Automatically generate Postman collections from your frontend code.'
  )
  .argument('<directory>', 'Directory to scan for API calls')
  .option(
    '-o, --output <path>',
    'Output path for the generated Postman collection'
  )
  .option(
    '-i, --include <pattern>',
    'Include only files that match the given pattern'
  )
  .option(
    '-e, --exclude <pattern>',
    'Exclude files that match the given pattern'
  )
  .action((directory, options) => {
    initializeGlobalContext(options);
    const appDirectory = path.resolve(directory);

    if (
      !fs.existsSync(appDirectory) ||
      !fs.statSync(appDirectory).isDirectory()
    ) {
      console.error(
        `The directory "${appDirectory}" does not exist or is not a directory.`
      );
      process.exit(1);
    }

    console.log(`Generating Postman collection for: ${appDirectory}`);

    // Determine the output path
    const outputPath = options.output
      ? path.resolve(options.output)
      : path.join(process.cwd(), 'postman_collection.json');

    const collection = generatePostmanCollection(appDirectory);

    fs.writeFileSync(outputPath, JSON.stringify(collection, null, 2));

    console.log(`Postman collection generated successfully: ${outputPath}`);
    console.log(`Total API calls found: ${collection.item.length}`);
  });

program.parse(process.argv);
