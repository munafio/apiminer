<p align="center">
  <img src="/_assets/logo.png" alt="APIMiner Logo" width="200"/>
</p>
<p align="center">
  <a href="https://www.npmjs.org/package/apiminer">
    <img src="https://img.shields.io/npm/v/apiminer.svg?style=flat-square">
  </a>
  <a href="#">
    <img src="https://img.shields.io/npm/l/apiminer?style=flat-square">
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square" />
  </a>
  <a href="https://www.npmjs.org/package/apiminer">
    <img src="http://img.shields.io/npm/dm/apiminer.svg?style=flat-square">
  </a>
</p>

**APIMiner** is a powerful tool designed to automatically extract API calls from your frontend JavaScript or TypeScript codebase and generate Postman collections with minimal effort. Ideal for frontend developers, APIMiner helps you document and test the API interactions within your client-side applications, ensuring that your API usage is transparent and well-organized.

<p align="center">
  <img src="/_assets/demo.gif" alt="APIMiner demo" width="100%"/>
</p>

## Support the Project ⭐

If you find APIMiner useful, please consider giving it a star on [GitHub](https://github.com/munafio/apiminer)! Your support helps the project grow and improves visibility within the community.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Command-Line Interface (CLI)](#command-line-interface-cli)
  - [Options](#options)
- [How It Works](#how-it-works)
  - [Supported Libraries](#supported-libraries)
  - [Context Management](#context-management)
  - [AST Traversal](#ast-traversal)
- [Examples](#examples)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Introduction

In modern web development, frontend applications increasingly rely on APIs to interact with servers and other services. Documenting and testing these API interactions can be a challenging task, especially in large or complex applications. **APIMiner** is here to make this easier by automatically generating Postman collections from your frontend codebase.

While many tools exist for documenting backend APIs, frontend developers often lack similar tools that focus on the client side. APIMiner fills this gap by providing a seamless way to document and test all API interactions in your frontend code, whether you're building with React, Vue, Angular, or plain JavaScript.

## Features

- **Automatic API Extraction**: Scans your frontend codebase and identifies all API calls made through popular HTTP libraries.
- **Postman Collection Generation**: Outputs a Postman collection that can be imported directly into Postman for testing and documentation.
- **Focus on Frontend**: Specifically designed for client-side code, ensuring that your frontend API usage is documented and ready for testing.
- **Multi-Library Support**: Works with popular frontend HTTP libraries, covering a wide range of use cases.
- **TypeScript Compatible**: Full support for TypeScript projects, respecting type definitions to ensure accurate documentation.
- **Context-Aware Processing**: Maintains a global context to accurately map out variable declarations, imports, and type interfaces within your frontend code.
- **Extensible Design**: Easily add support for additional HTTP libraries or customize how APIs are extracted.

## Installation

To install **APIMiner**, use npm:

```bash
npm install -g apiminer
```

This will install APIMiner globally, allowing you to use it from anywhere in your terminal.

## Usage

### Command-Line Interface (CLI)

APIMiner is designed to be used via the command line. The basic usage pattern involves specifying the directory containing your frontend code.

```bash
apiminer ./path/to/your/frontend/project
```

This command will scan the specified directory for API calls and generate a Postman collection in the current working directory.

### Options

APIMiner provides several options to customize the generation process:

- `-o, --output <path>`: Specifies the output path for the generated Postman collection. If not provided, the collection will be saved in the current directory as `postman_collection.json`.
- `-i, --include <pattern>`: Include only files that match the given pattern. Useful for focusing the scan on specific parts of your frontend codebase.
- `-e, --exclude <pattern>`: Exclude files that match the given pattern, helping to skip irrelevant files or directories.

### Examples

#### Basic Example

To generate a Postman collection for your frontend project:

```bash
apiminer ./src
```

This will scan all files in the `src` directory and create a Postman collection.

#### Specifying an Output Path

If you want to save the collection to a specific location:

```bash
apiminer ./src -o ./docs/api/postman_collection.json
```

This will generate the Postman collection and save it in the `docs/api` directory.

#### Including and Excluding Files

To include only certain files or exclude others:

```bash
apiminer ./src -i '**/*.ts' -e '**/*.spec.ts'
```

This will include only TypeScript files (`.ts`) and exclude test files (`.spec.ts`).

## How It Works

### Supported Libraries

APIMiner is designed to work with a variety of popular HTTP libraries commonly used in frontend development:

- **Axios**
- **Fetch**
- **Got**
- **Superagent**

APIMiner uses AST (Abstract Syntax Tree) traversal to identify API calls made using these libraries. It then extracts relevant information such as HTTP methods, URLs, and request bodies to build the Postman collection.

### Context Management

APIMiner’s context management is crucial for accurately documenting your API interactions. As the tool processes your frontend files, it maintains a global context that tracks:

- **Axios Instances**: Identifies custom Axios instances and their base URLs.
- **Imported Modules**: Keeps track of module imports to understand how different parts of your code interact.
- **Declared Variables**: Tracks variable declarations to resolve dynamic URLs or request bodies.
- **Type Interfaces**: Extracts TypeScript interfaces to generate example request bodies.

This context-aware approach ensures that APIMiner can accurately understand and extract API interactions, even in complex frontend applications.

### AST Traversal

APIMiner deeply analyzes your frontend code using AST traversal. It walks through the syntax tree of each file, identifying and processing API calls. By supporting various node types and handling edge cases like dynamic URLs or complex request bodies, APIMiner ensures comprehensive extraction of all relevant API calls.

## Testing

APIMiner includes a robust suite of tests to ensure reliability and correctness. The tests cover a wide range of scenarios, including:

- Files with multiple API calls.
- Handling of various frontend HTTP libraries.
- Edge cases like dynamic URLs and complex request bodies.

To run the tests:

```bash
npm test
```

The tests are written using Jest and validate the core functionality of APIMiner, ensuring that it performs as expected across different frontend codebases.

## Contributing

We welcome contributions from the community! Whether you want to add support for another frontend HTTP library, improve the documentation, or fix a bug, your contributions are appreciated.

#### To get started

fork the repository and submit a pull request. Please include tests for any new functionality or significant changes.

Do not forget to run `npm run prepare` before making/pushing any changes.

## Acknowledgments

Special thanks to the open-source community for providing the tools and libraries that made this project possible. Your contributions to the ecosystem inspire projects like APIMiner.
