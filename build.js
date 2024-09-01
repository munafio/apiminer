import esbuild from 'esbuild';

esbuild
  .build({
    entryPoints: ['./src/index.ts'],
    bundle: true,
    outdir: './dist',
    format: 'esm',
    platform: 'node',
    target: ['esnext'],
    sourcemap: true,
    minify: true,
    loader: { '.ts': 'ts' },
    outExtension: { '.js': '.js' },
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
