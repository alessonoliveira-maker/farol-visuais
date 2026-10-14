/**
 * Caminhos e descoberta de versoes do catalogo VISUAIS.
 *
 * Tudo e relativo a esta pasta, nunca ao diretorio de trabalho: a ferramenta roda igual chamada
 * de qualquer lugar, e o catalogo acompanha o Farol porque `APP_DIR` e irmao de `VISUAIS`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const RENDER_DIR = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
export const VISUAIS_DIR = path.dirname(RENDER_DIR);
export const APP_DIR = path.resolve(VISUAIS_DIR, '..', 'app');
export const APP_SRC = path.join(APP_DIR, 'src');
export const QA_DIR = path.join(RENDER_DIR, '.qa');
export const TMP_DIR = path.join(RENDER_DIR, '.tmp');
export const LOCK_DIR = path.join(RENDER_DIR, '.lock');
export const EXAMPLES_DIR = path.join(RENDER_DIR, 'exemplos');

/** Pastas que a descoberta nunca atravessa. */
const SKIP_DIRS = new Set(['node_modules', '.qa', '.tmp', '.lock', '.git', 'scripts', 'page']);

export function toPosix(p) {
  return p.split(path.sep).join('/');
}

/** Caminho relativo a VISUAIS, sempre com barra normal. */
export function relToVisuais(abs) {
  return toPosix(path.relative(VISUAIS_DIR, abs));
}

/** Resolve o argumento da linha de comando (relativo a VISUAIS, ou absoluto dentro dele). */
export function resolveTarget(arg) {
  if (!arg) {
    throw new Error(
      'Informe o caminho relativo a VISUAIS, por exemplo: 02_barras-horizontais (ou "." para tudo).',
    );
  }
  const cleaned = arg.replace(/\\/g, '/').replace(/^\.\/+/, '').replace(/^VISUAIS\//, '');
  const abs = path.isAbsolute(arg) ? path.resolve(arg) : path.resolve(VISUAIS_DIR, cleaned);
  const rel = path.relative(VISUAIS_DIR, abs);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error(`O caminho precisa estar dentro de VISUAIS: ${arg}`);
  }
  if (!fs.existsSync(abs) || !fs.statSync(abs).isDirectory()) {
    throw new Error(`Pasta inexistente: ${relToVisuais(abs) || '.'}`);
  }
  return abs;
}

function isInside(child, parent) {
  const rel = path.relative(parent, child);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

/**
 * Toda pasta com `Chart.tsx` sob o alvo e uma versao; a busca nao desce abaixo dela.
 * `_render` so e atravessado quando o alvo esta dentro dele (os exemplos entram quando pedidos).
 */
export function findVersions(absTarget) {
  const found = [];
  const targetInsideRender = isInside(path.resolve(absTarget), RENDER_DIR);
  const walk = (dir) => {
    if (fs.existsSync(path.join(dir, 'Chart.tsx'))) {
      found.push(dir);
      return;
    }
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory() || SKIP_DIRS.has(entry.name)) continue;
      const child = path.join(dir, entry.name);
      if (!targetInsideRender && path.resolve(child) === RENDER_DIR) continue;
      if (entry.name.startsWith('_') && path.resolve(child) !== RENDER_DIR && !isInside(child, RENDER_DIR)) {
        // Pastas com sublinhado na raiz (`_estudo`, rascunhos) nao sao catalogo.
        if (path.resolve(absTarget) !== path.resolve(child) && !isInside(path.resolve(absTarget), child)) {
          continue;
        }
      }
      walk(child);
    }
  };
  walk(absTarget);
  return found.sort().map((abs) => ({ abs, rel: relToVisuais(abs) }));
}

/**
 * Planeja N alvos posicionais, na ordem dada, e devolve a uniao das versoes.
 *
 * POR QUE EXISTE: `check` e `render` liam so `positional[0]`, entao passar varios alvos processava o
 * primeiro e DESCARTAVA o resto sem uma palavra. O custo nao foi o alvo perdido, foi a leitura: um
 * conserto que nunca rodou tem a mesma cara de um conserto que nao pegou, e contamina tudo o que vem
 * depois. Aqui todo alvo pedido aparece na saida, com versao ou com motivo.
 *
 * Alvo que nao resolve entra em `motivo` em vez de derrubar a chamada: falha de um alvo nao pode
 * cancelar os outros. A uniao e deduplicada por pasta, porque um alvo pai e um alvo filho na mesma
 * chamada nao podem renderizar a mesma versao duas vezes.
 *
 * Zero alvo posicional cai na mensagem de uso de `resolveTarget`, igual a antes.
 */
export function planTargets(args) {
  if (!args || args.length === 0) resolveTarget(undefined);
  const targets = [];
  const seen = new Set();
  const versions = [];
  for (const arg of args) {
    try {
      const abs = resolveTarget(arg);
      const found = findVersions(abs);
      for (const version of found) {
        if (seen.has(version.abs)) continue;
        seen.add(version.abs);
        versions.push(version);
      }
      targets.push({ arg, scope: relToVisuais(abs) || '.', abs, versions: found.map((v) => v.abs), motivo: null });
    } catch (error) {
      targets.push({ arg, scope: arg, abs: null, versions: [], motivo: error.message });
    }
  }
  return { targets, versions };
}

/**
 * Quebra o caminho de uma versao em familia, modelo e versao.
 * Aceita o catalogo (`fam/modelo/versao`) e os exemplos da ferramenta (`_render/exemplos/...`).
 */
export function splitVersion(rel) {
  const parts = rel.split('/');
  const version = parts.at(-1) ?? '';
  const model = parts.at(-2) ?? '';
  const family = parts.at(-3) ?? '';
  const prefix = parts.slice(0, -3).join('/');
  return { family, model, version, prefix, depth: parts.length };
}

export const NAME_PATTERNS = {
  family: /^\d{2}_[a-z0-9]+(?:-[a-z0-9]+)*$/,
  model: /^\d{2}_[a-z0-9]+(?:-[a-z0-9]+)*$/,
  version: /^v\d+_[a-z0-9]+(?:-[a-z0-9]+)*$/,
};

/** Os prefixos validos acima de uma familia: a raiz do catalogo ou a pasta de exemplos. */
export const VALID_PREFIXES = new Set(['', '_render/exemplos']);

export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

/** Grava de forma atomica: temporario e rename, para leitor concorrente nunca ver meio arquivo. */
export function writeFileAtomic(file, content) {
  ensureDir(path.dirname(file));
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, content);
  fs.renameSync(tmp, file);
}

/**
 * Le os argumentos: posicionais e `--chave valor` ou `--chave=valor`.
 *
 * `booleanFlags` nomeia as chaves que NAO levam valor. Sem essa lista, `--sem-tipos alvo2` engolia
 * `alvo2` como valor da flag e o alvo desaparecia calado: o mesmo defeito, pela outra porta, de ler
 * so `positional[0]`. Quem aceita varios alvos declara suas flags de liga-desliga aqui.
 */
export function parseArgs(argv, { booleanFlags = [] } = {}) {
  const booleans = new Set(booleanFlags);
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const [key, inline] = arg.slice(2).split('=', 2);
      if (inline !== undefined) flags[key] = inline;
      else if (!booleans.has(key) && argv[i + 1] && !argv[i + 1].startsWith('--')) {
        flags[key] = argv[i + 1];
        i += 1;
      } else flags[key] = true;
    } else positional.push(arg);
  }
  return { positional, flags };
}
