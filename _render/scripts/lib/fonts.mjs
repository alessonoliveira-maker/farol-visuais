/**
 * Fontes: o mesmo conjunto que o Farol carrega, e o recorte embutido no SVG.
 *
 * O conjunto carregado nao e copiado: ele e lido dos `import '@fontsource/...'` do
 * `app/src/main.tsx`. A pagina de render importa exatamente esses arquivos, entao o casamento de
 * peso que o navegador faz (pedir 800 e receber 700, por exemplo) e o mesmo do Farol.
 *
 * No SVG entra so o que foi usado: para cada face (familia, peso, estilo) o recorte leva apenas
 * os caracteres impressos, com todas as features OpenType mantidas (algarismo tabular incluso),
 * em woff2 base64. O SVG abre sozinho, sem rede e sem fonte instalada.
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import { APP_SRC, RENDER_DIR } from './paths.mjs';

const require = createRequire(import.meta.url);
const subsetFont = require('subset-font');

const FONTSOURCE_DIR = path.join(RENDER_DIR, 'node_modules', '@fontsource');

/** Os especificadores `@fontsource/...css` que o Farol importa, na ordem. */
export function farolFontImports() {
  const main = fs.readFileSync(path.join(APP_SRC, 'main.tsx'), 'utf8');
  const specs = [...main.matchAll(/import\s+['"](@fontsource\/[^'"]+\.css)['"]/g)].map((m) => m[1]);
  if (specs.length === 0) throw new Error('Nenhuma fonte @fontsource encontrada em app/src/main.tsx.');
  for (const spec of specs) {
    if (/\binter\b/i.test(spec)) throw new Error(`Fonte proibida importada pelo app: ${spec}`);
  }
  return specs;
}

function parseUnicodeRange(text) {
  return text.split(',').map((part) => {
    const token = part.trim().replace(/^U\+/i, '');
    if (token.includes('?')) {
      return [parseInt(token.replace(/\?/g, '0'), 16), parseInt(token.replace(/\?/g, 'F'), 16)];
    }
    const [a, b] = token.split('-');
    return [parseInt(a, 16), parseInt(b ?? a, 16)];
  });
}

let facesCache = null;

/**
 * As faces carregadas pelo Farol: familia, peso, estilo, subconjunto, faixa unicode e arquivo.
 * A faixa vem do CSS combinado do pacote (`400.css`), que declara `unicode-range` por subconjunto.
 */
export function loadedFaces() {
  if (facesCache) return facesCache;
  const faces = [];
  for (const spec of farolFontImports()) {
    const match = /^@fontsource\/([^/]+)\/(?:([a-z-]+)-)?(\d{3})(?:-(italic))?\.css$/.exec(spec);
    if (!match) {
      console.warn(`[fontes] import nao reconhecido, ignorado: ${spec}`);
      continue;
    }
    const [, pkg, subset, weight, italic] = match;
    const combined = path.join(FONTSOURCE_DIR, pkg, `${weight}${italic ? '-italic' : ''}.css`);
    const css = fs.readFileSync(combined, 'utf8');
    // A faixa sai do CSS COMBINADO, mas quem a pagina carrega e o arquivo do `import`. Os dois nao
    // dizem a mesma coisa: os `@fontsource/<fonte>/<subconjunto>-<peso>.css` nao declaram
    // `unicode-range`, porque foram feitos para ser usados um de cada vez. Guardar essa diferenca
    // aqui e o que permite acusar a colisao em `faceCollisions()`.
    const importedDeclaresRange = /unicode-range/.test(
      fs.readFileSync(path.join(FONTSOURCE_DIR, spec.replace('@fontsource/', '')), 'utf8'),
    );
    for (const block of css.matchAll(/\/\*\s*([a-z0-9-]+)\s*\*\/\s*@font-face\s*{([^}]*)}/g)) {
      const [, name, body] = block;
      const blockSubset = name.replace(`${pkg}-`, '').replace(/-\d{3}-(normal|italic)$/, '');
      if (subset && blockSubset !== subset) continue;
      const family = /font-family:\s*'([^']+)'/.exec(body)?.[1];
      const style = /font-style:\s*(\w+)/.exec(body)?.[1] ?? 'normal';
      const range = /unicode-range:\s*([^;]+);/.exec(body)?.[1]?.trim();
      const file = /url\(\.\/files\/([^)]+\.woff2)\)/.exec(body)?.[1];
      if (!family || !file) continue;
      faces.push({
        family,
        weight: Number(weight),
        style,
        subset: blockSubset,
        unicodeRangeText: range ?? null,
        ranges: range ? parseUnicodeRange(range) : [[0, 0x10ffff]],
        file: path.join(FONTSOURCE_DIR, pkg, 'files', file),
        spec,
        importedDeclaresRange,
      });
    }
  }
  facesCache = faces;
  return faces;
}

/**
 * As familias em que a pagina e o SVG NAO escolhem a mesma face para o mesmo caractere.
 *
 * POR QUE EXISTE, medido. O app importa `@fontsource/manrope/latin-400.css` e
 * `@fontsource/manrope/latin-ext-400.css`. Nenhum dos dois declara `unicode-range`, entao a pagina
 * fica com DUAS regras `@font-face` para `Manrope 400 normal` sem faixa, e o navegador compoe as
 * duas por glifo; o preview, que le a faixa do CSS combinado (`400.css`), manda cada caractere para
 * uma face so. Resultado medido no par "PL" de "CPL", Manrope 400 a 12 px: o prefixo "O CPL" mede
 * 33,047 px na pagina e 32,453 px no arquivo, uma diferenca de 0,594 px que vem do par de kerning
 * P->L, aplicado no arquivo e perdido na pagina. Dai para a frente a linha inteira anda, e e por
 * isso que a divergencia parece "comecar no caractere seguinte a sigla": sigla e onde o kerning de
 * caixa alta pesa.
 *
 * O conserto nao cabe na ferramenta: o preview nao consegue reproduzir a composicao da pagina sem
 * embutir os arquivos INTEIROS (medido: recorte sem `unicode-range` continua dando 32,453, so o
 * arquivo completo sem faixa da 33,047). O conserto e de uma linha por peso em `app/src/main.tsx`:
 * trocar os imports por subconjunto pelos combinados (`@fontsource/manrope/400.css`, `500.css`,
 * `600.css`, `700.css`, `@fontsource/space-grotesk/500.css`, `600.css`, `700.css`), que declaram
 * `unicode-range`. Ai a pagina passa a escolher a face por faixa, igual ao preview, e a diferenca
 * vai a zero sem ninguem escrever sigla por extenso.
 */
export function faceCollisions() {
  const grupos = new Map();
  for (const face of loadedFaces()) {
    const chave = `${face.family} ${face.weight} ${face.style}`;
    const lista = grupos.get(chave) ?? [];
    lista.push(face);
    grupos.set(chave, lista);
  }
  return [...grupos]
    .filter(([, lista]) => lista.length > 1 && lista.some((face) => !face.importedDeclaresRange))
    .map(([chave, lista]) => ({ face: chave, specs: lista.map((f) => f.spec) }));
}

/** O algoritmo de casamento de peso do CSS Fonts 4, sobre os pesos disponiveis. */
export function matchWeight(requested, available) {
  const sorted = [...new Set(available)].sort((a, b) => a - b);
  if (sorted.includes(requested)) return requested;
  const below = sorted.filter((w) => w < requested).reverse();
  const above = sorted.filter((w) => w > requested);
  if (requested >= 400 && requested <= 500) {
    const upTo500 = above.filter((w) => w <= 500);
    return upTo500[0] ?? below[0] ?? above[0];
  }
  if (requested < 400) return below[0] ?? above[0];
  return above[0] ?? below[0];
}

const subsetCache = new Map();

/**
 * Monta os `@font-face` embutidos a partir do uso medido na pagina.
 * `usage` e `{ "Manrope|600|normal": "caracteres impressos" }`.
 *
 * Os caracteres sao somados por FACE REAL antes do recorte: dois pesos pedidos que caem na mesma
 * face (550 e 600, por exemplo) precisam de um recorte so, senao a segunda regra de mesma familia,
 * peso e faixa esconderia os glifos da primeira.
 */
export async function buildFontFaces(usage) {
  const faces = loadedFaces();
  const perFace = new Map();
  const missing = [];
  for (const [key, chars] of Object.entries(usage).sort()) {
    const [family, weightText, styleText] = key.split('|');
    const familyFaces = faces.filter((face) => face.family === family);
    if (!chars) continue;
    if (familyFaces.length === 0) {
      missing.push(family);
      continue;
    }
    const style = familyFaces.some((face) => face.style === styleText) ? styleText : 'normal';
    const styled = familyFaces.filter((face) => face.style === style);
    const weight = matchWeight(Number(weightText) || 400, styled.map((face) => face.weight));
    // O espaço entra sempre: o coletor ignora branco, e sem o glifo de espaço cada palavra depois
    // da primeira anda com a largura de espaço de outra fonte (defeito medido no primeiro render).
    const codepoints = [...new Set([0x20, 0xa0, ...[...chars].map((c) => c.codePointAt(0))])];
    for (const face of styled.filter((f) => f.weight === weight)) {
      const covered = codepoints.filter((cp) => face.ranges.some(([a, b]) => cp >= a && cp <= b));
      if (covered.length === 0) continue;
      const set = perFace.get(face) ?? new Set();
      for (const cp of covered) set.add(cp);
      perFace.set(face, set);
    }
  }
  const rules = [];
  const report = [];
  let bytes = 0;
  for (const [face, set] of perFace) {
    const text = String.fromCodePoint(...[...set].sort((a, b) => a - b));
    const cacheKey = `${face.file}|${text}`;
    let base64 = subsetCache.get(cacheKey);
    if (!base64) {
      const subset = await subsetFont(fs.readFileSync(face.file), text, { targetFormat: 'woff2' });
      base64 = Buffer.from(subset).toString('base64');
      subsetCache.set(cacheKey, base64);
    }
    bytes += base64.length;
    report.push(`${face.family} ${face.weight} ${face.subset}: ${set.size} glifos, ${(base64.length / 1024).toFixed(1)} KB`);
    rules.push(
      `@font-face{font-family:'${face.family}';font-style:${face.style};font-weight:${face.weight};` +
        (face.unicodeRangeText ? `unicode-range:${face.unicodeRangeText};` : '') +
        `src:url(data:font/woff2;base64,${base64}) format('woff2')}`,
    );
  }
  return { css: rules.join(''), bytes, report, missingFamilies: [...new Set(missing)] };
}
