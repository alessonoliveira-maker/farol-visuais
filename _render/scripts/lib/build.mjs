/**
 * Empacota a pagina de render com as versoes pedidas, numa execucao so do Vite.
 *
 * - CSS: o `index.css` do proprio Farol, importado por caminho relativo (tokens, `@theme`, base),
 *   mais `@source` apontando so para a pagina e para as pastas das versoes.
 * - Fontes: os mesmos `@fontsource/...css` que o `app/src/main.tsx` importa.
 * - `@/` aponta para `app/src`, igual ao Farol.
 * - Todo import "nu" (react, recharts, clsx...) vindo de fora de `_render/node_modules` e resolvido
 *   a partir de `_render`: uma copia so de React, e o catalogo nao depende do `node_modules` do app.
 */
import fs from 'node:fs';
import path from 'node:path';

import { APP_SRC, RENDER_DIR, TMP_DIR, ensureDir, toPosix } from './paths.mjs';
import { farolFontImports } from './fonts.mjs';

const RENDER_NODE_MODULES = path.join(RENDER_DIR, 'node_modules');
const RESOLVE_ANCHOR = path.join(RENDER_DIR, 'page', 'harness.tsx');

function isInside(child, parent) {
  const rel = path.relative(parent, child);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

function relImport(fromDir, target) {
  let rel = toPosix(path.relative(fromDir, target));
  if (!rel.startsWith('.')) rel = `./${rel}`;
  return rel;
}

function resolveFromRender() {
  return {
    name: 'farol-resolve-from-render',
    enforce: 'pre',
    async resolveId(source, importer, options) {
      if (!importer || source.startsWith('\0') || source.startsWith('.') || source.startsWith('/')) return null;
      if (source.startsWith('@/') || /^[A-Za-z]:[\\/]/.test(source) || source.includes(':')) return null;
      const importerPath = importer.split('?')[0];
      if (isInside(importerPath, RENDER_NODE_MODULES)) return null;
      return this.resolve(source, RESOLVE_ANCHOR, { ...options, skipSelf: true });
    },
  };
}

/**
 * @param {{ rel: string, abs: string, meta: object }[]} entries
 * @returns {Promise<{ runDir: string, distDir: string }>}
 */
export async function buildBundle(entries) {
  const { build } = await import('vite');
  const { default: tailwindcss } = await import('@tailwindcss/vite');

  const runDir = path.join(TMP_DIR, `run-${process.pid}-${Date.now()}`);
  const distDir = path.join(runDir, 'dist');
  ensureDir(runDir);

  const css = [
    `@import '${relImport(runDir, path.join(APP_SRC, 'styles', 'index.css'))}';`,
    `@source '${relImport(runDir, path.join(RENDER_DIR, 'page'))}';`,
    ...entries.map((entry) => `@source '${relImport(runDir, entry.abs)}';`),
    '',
  ].join('\n');
  fs.writeFileSync(path.join(runDir, 'render.css'), css);

  const lines = [
    ...farolFontImports().map((spec) => `import '${spec}';`),
    `import './render.css';`,
    `import { mount } from '${relImport(runDir, RESOLVE_ANCHOR).replace(/\.tsx$/, '')}';`,
    ...entries.map((entry, i) => `import Chart${i} from '${relImport(runDir, path.join(entry.abs, 'Chart.tsx')).replace(/\.tsx$/, '')}';`),
    '',
    'mount([',
    ...entries.map(
      (entry, i) =>
        `  { rel: ${JSON.stringify(entry.rel)}, Chart: Chart${i}, meta: ${JSON.stringify({
          title: entry.meta.title,
          useCase: entry.meta.useCase,
          frame: entry.meta.frame,
          width: entry.meta.canvas.width,
          height: entry.meta.canvas.height,
        })} },`,
    ),
    ']);',
    '',
  ];
  fs.writeFileSync(path.join(runDir, 'entry.tsx'), lines.join('\n'));
  fs.writeFileSync(
    path.join(runDir, 'index.html'),
    '<!doctype html><html lang="pt-BR" data-theme="dark"><head><meta charset="utf-8"><link rel="icon" href="data:,"><title>render VISUAIS</title></head><body><div id="root"></div><script type="module" src="./entry.tsx"></script></body></html>',
  );

  await build({
    root: runDir,
    base: './',
    configFile: false,
    envFile: false,
    logLevel: 'warn',
    mode: 'development',
    cacheDir: path.join(TMP_DIR, 'vite-cache'),
    define: { 'process.env.NODE_ENV': JSON.stringify('development') },
    plugins: [resolveFromRender(), tailwindcss()],
    resolve: {
      alias: [{ find: /^@\//, replacement: `${toPosix(APP_SRC)}/` }],
      dedupe: ['react', 'react-dom', 'recharts'],
    },
    esbuild: { jsx: 'automatic' },
    build: {
      outDir: distDir,
      emptyOutDir: true,
      minify: false,
      sourcemap: false,
      target: 'es2022',
      assetsInlineLimit: 0,
      reportCompressedSize: false,
      modulePreload: false,
      chunkSizeWarningLimit: 100_000,
      rollupOptions: {
        // O `"use client"` do lucide-react e diretiva de React Server Components: irrelevante numa
        // pagina estatica, e o aviso repetido a cada render so escondia avisos que importam.
        onwarn(warning, warn) {
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
          warn(warning);
        },
      },
    },
  });
  return { runDir, distDir };
}
