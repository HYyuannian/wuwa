import { build } from 'esbuild'

await build({
  entryPoints: ['server/standalone.ts'],
  outfile: 'dist-server/server.mjs',
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  banner: {
    js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);",
  },
  logLevel: 'info',
})
