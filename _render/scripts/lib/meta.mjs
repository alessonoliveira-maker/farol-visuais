/**
 * Metadados da versao (`meta.json`), presets de canvas e os carimbos do preview (origem, tokens e
 * biblioteca compartilhada).
 *
 * Os metadados ficam num arquivo proprio, fora do `Chart.tsx` e do `data.ts`, porque esses dois
 * sao copiados para o Farol: titulo de catalogo e tamanho de canvas nao podem sujar o codigo
 * que vai para producao.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { APP_SRC } from './paths.mjs';

/** Versao do formato do preview; mudar aqui invalida os carimbos de todos os SVGs. */
export const RENDERER_VERSION = '1';

/** Tamanho total do SVG (moldura inclusa), em pixels CSS. */
export const CANVAS_PRESETS = {
  kpi: { width: 360, height: 180 },
  'kpi-alto': { width: 360, height: 280 },
  card: { width: 640, height: 360 },
  quadrado: { width: 480, height: 480 },
  largo: { width: 960, height: 400 },
  faixa: { width: 960, height: 260 },
  alto: { width: 640, height: 560 },
};

const ALLOWED_KEYS = new Set(['title', 'useCase', 'demonstrates', 'canvas', 'frame', 'notes']);

/** Moldura da ferramenta: `card` imita o VisualCard; `stage` e palco para o visual que ja e cartao. */
export const FRAMES = ['card', 'stage'];

function hasSentenceDash(text) {
  return /\s[-–—]\s|[–—]/.test(text);
}

export function resolveCanvas(canvas) {
  if (typeof canvas === 'string') {
    const preset = CANVAS_PRESETS[canvas];
    return preset ? { ...preset, preset: canvas } : null;
  }
  if (canvas && typeof canvas === 'object') {
    const { width, height } = canvas;
    const ok = (n) => Number.isInteger(n) && n >= 200 && n <= 1600;
    if (ok(width) && ok(height)) return { width, height, preset: null };
  }
  return null;
}

/** Le e valida o `meta.json`. Devolve o objeto normalizado e as mensagens. */
export function readMeta(versionAbs) {
  const errors = [];
  const warnings = [];
  const file = path.join(versionAbs, 'meta.json');
  if (!fs.existsSync(file)) {
    return { meta: null, errors: ['meta.json ausente (titulo, caso de uso, o que demonstra, canvas).'], warnings };
  }
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    return { meta: null, errors: [`meta.json invalido: ${error.message}`], warnings };
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { meta: null, errors: ['meta.json precisa ser um objeto.'], warnings };
  }
  for (const key of Object.keys(raw)) {
    if (!ALLOWED_KEYS.has(key)) errors.push(`meta.json: chave desconhecida "${key}".`);
  }
  const text = (key, min, max) => {
    const value = raw[key];
    if (typeof value !== 'string' || value.trim().length < min) {
      errors.push(`meta.json: "${key}" precisa ser texto com pelo menos ${min} caracteres.`);
      return '';
    }
    if (value.length > max) errors.push(`meta.json: "${key}" passa de ${max} caracteres (${value.length}).`);
    if (hasSentenceDash(value)) errors.push(`meta.json: "${key}" usa hifen, travessao ou meia risca como separador.`);
    return value.trim();
  };
  const title = text('title', 3, 60);
  const useCase = text('useCase', 10, 140);
  let demonstrates = [];
  if (!Array.isArray(raw.demonstrates) || raw.demonstrates.length === 0 || raw.demonstrates.length > 6) {
    errors.push('meta.json: "demonstrates" precisa ser lista de 1 a 6 textos.');
  } else {
    demonstrates = raw.demonstrates.filter((item) => {
      const valid = typeof item === 'string' && item.trim().length >= 3 && item.length <= 90;
      if (!valid) errors.push('meta.json: cada item de "demonstrates" precisa ter de 3 a 90 caracteres.');
      else if (hasSentenceDash(item)) errors.push(`meta.json: "demonstrates" usa hifen como separador: ${item}`);
      return valid;
    });
  }
  const canvas = resolveCanvas(raw.canvas);
  if (!canvas) {
    errors.push(
      `meta.json: "canvas" precisa ser um preset (${Object.keys(CANVAS_PRESETS).join(', ')}) ou { "width": 200..1600, "height": 200..1600 }.`,
    );
  }
  if (raw.notes !== undefined && typeof raw.notes !== 'string') errors.push('meta.json: "notes" precisa ser texto.');
  // CANVAS-DECLARADO. A ESP-2 permite a peca passar do preset, e manda declarar: canvas por numero
  // com `notes` vazio e desvio calado, que o contrato trata como irregularidade. A regra existia
  // desde 2026-09-17 sem ninguem para medi-la, e nas 64 primeiras versoes seis passaram assim.
  const notesTexto = typeof raw.notes === 'string' ? raw.notes.trim() : '';
  if (canvas && canvas.preset === null && !notesTexto) {
    errors.push(
      `meta.json: "canvas" fixado por numero (${canvas.width} x ${canvas.height}) sem uma linha em "notes" dizendo de onde sai o tamanho. ` +
        'A ESP-2 aceita a peca passar do preset, desde que o desvio seja declarado: escreva a conta (o passo da ESP-6, quantas categorias a altura comporta) ou por que o preset nao serve.',
    );
  }
  if (canvas && canvas.preset === null) {
    const igual = Object.entries(CANVAS_PRESETS).find(([, v]) => v.width === canvas.width && v.height === canvas.height);
    if (igual) warnings.push(`meta.json: "canvas" por numero mede exatamente o preset ${igual[0]}; escreva o nome do preset e o leitor entende de primeira.`);
  }
  const frame = raw.frame ?? 'card';
  if (!FRAMES.includes(frame)) errors.push(`meta.json: "frame" precisa ser ${FRAMES.join(' ou ')}.`);
  const meta = { title, useCase, demonstrates, canvas, frame, notes: raw.notes ?? '' };
  return { meta: errors.length ? null : meta, draft: meta, errors, warnings };
}

function normalized(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n') : '';
}

/** Carimbo do que gerou o preview: Chart.tsx, data.ts e meta.json. */
export function sourceHash(versionAbs) {
  const hash = crypto.createHash('sha256');
  hash.update(RENDERER_VERSION);
  for (const name of ['Chart.tsx', 'data.ts', 'meta.json']) {
    hash.update(`\n--${name}--\n`);
    hash.update(normalized(path.join(versionAbs, name)));
  }
  return hash.digest('hex').slice(0, 16);
}

/** Carimbo dos tokens do Farol: quando muda, o preview ainda e valido, mas esta velho. */
export function tokensHash() {
  const hash = crypto.createHash('sha256');
  hash.update(normalized(path.join(APP_SRC, 'styles', 'tokens.css')));
  hash.update(normalized(path.join(APP_SRC, 'styles', 'index.css')));
  return hash.digest('hex').slice(0, 16);
}

/**
 * Os arquivos da biblioteca compartilhada do Farol que entram no carimbo `data-farol-lib`, relativos
 * a `app/src`. A lista e a do CONTRATO.md, secao 13: mexer aqui muda o carimbo de TODO preview ja
 * carimbado (uma onda de avisos no acervo inteiro), entao arquivo novo entra por decisao, nao por
 * conveniencia.
 *
 * Ajuste de 2026-10-01 (F0.2b, decisao do dono, antes do primeiro render carimbado do acervo):
 * `valueFormat.ts` ENTRA, porque 153 das 491 versoes dependem dele (6 o importam direto e 147 pelo
 * `ChartTooltip`) e mexer nele passava sem aviso; `chartAria.ts` SAI, porque nenhuma versao o importa
 * (0 de 491, e ele nao esta nos imports permitidos) e edita-lo avisaria o acervo inteiro sem mudar
 * desenho algum. Entra na lista o que alguma versao alcanca; o que nenhuma alcanca fica de fora.
 */
export const LIB_FILES = [
  'lib/format.ts',
  'lib/utils.ts',
  'components/visuals/valueFormat.ts',
  'components/visuals/charts/chartTheme.ts',
  'components/visuals/charts/ChartTooltip.tsx',
];

/**
 * Carimbo da biblioteca compartilhada: quando muda, o desenho PODE ter mudado sem o Chart.tsx mudar.
 *
 * Separado do `sourceHash` de proposito. Somado a ele, a primeira linha mexida em `format.ts` viraria
 * erro de "preview desatualizado" nas 491 versoes de uma vez, e o acervo aprovado ficaria vermelho
 * por uma mudanca que talvez nem alcance a peca. Aqui ele segue o modelo do `tokensHash`: o preview
 * continua valido, e o check so avisa.
 *
 * `appSrc` existe para a prova: o selftest aponta para uma copia temporaria da biblioteca e altera um
 * formatador nela, sem tocar em `app/`.
 */
export function libHash(appSrc = APP_SRC) {
  const hash = crypto.createHash('sha256');
  for (const rel of LIB_FILES) {
    hash.update(`\n--${rel}--\n`);
    hash.update(normalized(path.join(appSrc, ...rel.split('/'))));
  }
  return hash.digest('hex').slice(0, 16);
}

/**
 * Le os carimbos gravados no preview.svg. `lib` vem `null` no preview anterior a emenda do carimbo
 * da biblioteca (2026-10-01), e quem le trata `null` como "nao medido", nunca como "diferente".
 */
export function readPreviewStamps(svgFile) {
  if (!fs.existsSync(svgFile)) return null;
  const head = fs.readFileSync(svgFile, 'utf8').slice(0, 2000);
  const source = /data-farol-source="([a-f0-9]+)"/.exec(head)?.[1] ?? null;
  const tokens = /data-farol-tokens="([a-f0-9]+)"/.exec(head)?.[1] ?? null;
  const lib = /data-farol-lib="([a-f0-9]+)"/.exec(head)?.[1] ?? null;
  const theme = /data-farol-theme="([a-z]+)"/.exec(head)?.[1] ?? null;
  return { source, tokens, lib, theme };
}

/** Os nomes de token CSS que existem no Farol (tokens.css e o @theme do index.css). */
export function knownTokens() {
  const names = new Set();
  for (const file of ['tokens.css', 'index.css']) {
    const css = normalized(path.join(APP_SRC, 'styles', file));
    for (const match of css.matchAll(/(--[a-z0-9-]+)\s*:/gi)) names.add(match[1]);
  }
  return names;
}
