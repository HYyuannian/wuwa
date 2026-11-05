import { build } from 'esbuild'

await build({
  entryPoints: ['api-entry.ts'],
  outfile: 'api/[...route].js',
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  banner: {
    js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);",
  },
  logLevel: 'info',
})
