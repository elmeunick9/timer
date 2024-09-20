const esbuild = require('esbuild');

// Bundle for Node.js (CommonJS)
esbuild.buildSync({
    entryPoints: ['src/index.ts'],
    bundle: true,
    platform: 'node',
    target: ['node14'],
    outfile: 'dist/index.js',
});

// Bundle for browsers (ES module)
esbuild.buildSync({
    entryPoints: ['src/index.ts'],
    bundle: true,
    platform: 'browser',
    target: ['es2018'],
    outfile: 'dist/index.mjs',
    format: 'esm',
});