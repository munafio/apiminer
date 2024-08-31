import esbuild from 'esbuild';

esbuild
  .build({
    entryPoints: ['./src/index.ts'],
    bundle: true,
    outdir: './dist',
    format: 'esm', // Ensure the output is an ES module
    platform: 'node', // Target Node.js environment
    target: ['esnext'], // Use the latest ES features
    sourcemap: true, // Generate source maps
    minify: false, // Avoid minification for debugging purposes
    loader: { '.ts': 'ts' }, // Handle TypeScript files
    outExtension: { '.js': '.js' }, // Ensure .js extension is used
    external: [
      '@babel/traverse',
      '@babel/parser',
      '@babel/types',
      'kleur',
      'fs',
      'path',
      'os',
      'util',
      'debug',
      'axios',
    ],
  })
  .catch(() => process.exit(1));
