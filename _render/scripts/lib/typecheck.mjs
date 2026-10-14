/**
 * Typecheck estrito das versões, compartilhado por `check` e `pendencias`.
 *
 * Um programa TypeScript só para todas as versões recebidas, com as opções do `app/tsconfig.json`,
 * mais uma sonda por versão que monta `<Chart />` sem props e `<Chart data={data} />`. Quem chama
 * é responsável por envolver a chamada na trava entre processos (`withLock`).
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import { APP_DIR, APP_SRC, RENDER_DIR, TMP_DIR, VISUAIS_DIR, ensureDir, toPosix } from './paths.mjs';

const require = createRequire(import.meta.url);
const ts = require('typescript');

function relImport(fromDir, target) {
  let rel = toPosix(path.relative(fromDir, target));
  if (!rel.startsWith('.')) rel = `./${rel}`;
  return rel.replace(/\.tsx?$/, '');
}

function compilerOptions() {
  const configFile = path.join(APP_DIR, 'tsconfig.json');
  const read = ts.readConfigFile(configFile, ts.sys.readFile);
  if (read.error) throw new Error(ts.flattenDiagnosticMessageText(read.error.messageText, '\n'));
  const parsed = ts.parseJsonConfigFileContent(read.config, ts.sys, APP_DIR, undefined, configFile);
  const nodeModules = toPosix(path.join(RENDER_DIR, 'node_modules'));
  return {
    ...parsed.options,
    noEmit: true,
    // Sem tipos globais de node e vite: componente do catálogo não usa process nem import.meta.env.
    types: [],
    baseUrl: RENDER_DIR,
    // Uma cópia só de React e Recharts para catálogo E Farol: a do _render. Sem isto, o arquivo do
    // app resolveria o node_modules do app e o JSX teria dois @types/react incompatíveis.
    paths: {
      '@/*': [`${toPosix(APP_SRC)}/*`],
      // @types primeiro: na ordem inversa `react` casa com react/index.js e perde os tipos.
      '*': [`${nodeModules}/@types/*`, `${nodeModules}/*`],
    },
    incremental: false,
    tsBuildInfoFile: undefined,
  };
}

function formatDiagnostic(diagnostic, probeOwners) {
  const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
  if (!diagnostic.file) return { owner: null, text: `TS${diagnostic.code}: ${message}` };
  const file = path.resolve(diagnostic.file.fileName);
  const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start ?? 0);
  const probe = probeOwners.get(file);
  if (probe) {
    const snippet = diagnostic.file.text.split(/\r?\n/)[line] ?? '';
    const hint = snippet.includes('data={data}')
      ? 'a prop data não aceita o export data do data.ts'
      : snippet.includes('<Chart />')
        ? 'o Chart não monta sem props (há prop obrigatória)'
        : 'sonda de contrato';
    return { owner: probe, text: `contrato de tipos: ${hint}. TS${diagnostic.code}: ${message}` };
  }
  return { owner: file, text: `${path.basename(file)}:${line + 1}:${character + 1} TS${diagnostic.code}: ${message}` };
}

/**
 * Devolve `byVersion` (Map de caminho absoluto da versão para lista de erros), `outside` (erros
 * fora das versões: Farol ou configuração) e `ms` (tempo do compilador).
 */
export function typecheck(versions) {
  const runDir = path.join(TMP_DIR, `check-${process.pid}-${Date.now()}`);
  ensureDir(runDir);
  const probeOwners = new Map();
  const rootNames = [];
  try {
    versions.forEach((version, index) => {
      const chart = path.join(version.abs, 'Chart.tsx');
      const data = path.join(version.abs, 'data.ts');
      if (!fs.existsSync(chart) || !fs.existsSync(data)) return;
      const probe = path.join(runDir, `probe_${index}.tsx`);
      fs.writeFileSync(
        probe,
        [
          `import Chart from '${relImport(runDir, chart)}';`,
          `import { data } from '${relImport(runDir, data)}';`,
          '',
          'export const probeWithoutProps = <Chart />;',
          'export const probeWithData = <Chart data={data} />;',
          '',
        ].join('\n'),
      );
      probeOwners.set(path.resolve(probe), version.abs);
      rootNames.push(chart, data, probe);
    });
    if (rootNames.length === 0) return { byVersion: new Map(), outside: [], ms: 0 };
    const started = Date.now();
    const program = ts.createProgram({ rootNames, options: compilerOptions() });
    const diagnostics = ts.getPreEmitDiagnostics(program);
    const byVersion = new Map();
    const outside = [];
    for (const diagnostic of diagnostics) {
      const { owner, text } = formatDiagnostic(diagnostic, probeOwners);
      const version = owner ? versions.find((v) => owner === v.abs || owner.startsWith(`${v.abs}${path.sep}`)) : null;
      if (version) {
        const list = byVersion.get(version.abs) ?? [];
        list.push(text);
        byVersion.set(version.abs, list);
      } else {
        outside.push(owner ? `${toPosix(path.relative(VISUAIS_DIR, owner))}: ${text}` : text);
      }
    }
    return { byVersion, outside, ms: Date.now() - started };
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
}
