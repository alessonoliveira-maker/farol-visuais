/**
 * Levantamento de pendências: compara o catálogo planejado (`_estudo/catalogo.json`) com o que
 * existe em disco, o contrato (mesma lógica do `check`), os READMEs e os vereditos de revisão.
 */
import fs from 'node:fs';
import path from 'node:path';

import { checkFamilyReadme, checkModelReadme, checkVersion } from './contract.mjs';
import { VISUAIS_DIR, findVersions, relToVisuais, splitVersion } from './paths.mjs';
import { fingerprint, readReviews, reviewProblem } from './revisao.mjs';

/** Ordem canônica dos motivos, do mais estrutural ao mais fino. */
export const MOTIVOS = [
  'sem_pasta',
  'sem_chart',
  'sem_data',
  'sem_meta',
  'sem_preview',
  'sem_preview_claro',
  'check_erro',
  'sem_readme_modelo',
  'sem_revisao',
  'revisao_reprovada',
  'revisao_desatualizada',
];

export const CATALOG_FILE = path.join(VISUAIS_DIR, '_estudo', 'catalogo.json');

/** Erros do check que já têm motivo próprio e não devem virar check_erro em dobro. */
const COVERED_ERROR = /^(?:Chart\.tsx ausente|data\.ts ausente|meta\.json ausente|preview\.svg ausente)/;

function entry(rel) {
  const { family, model, version } = splitVersion(rel);
  return { family, model, versionName: version, rel, abs: path.join(VISUAIS_DIR, ...rel.split('/')) };
}

/** Versões esperadas pelo catálogo, na ordem do catálogo. */
export function loadCatalog() {
  const catalog = JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf8'));
  const expected = [];
  for (const family of catalog) {
    for (const model of family.modelos ?? []) {
      for (const version of model.versoes ?? []) expected.push(entry(`${family.slug}/${model.slug}/${version.slug}`));
    }
  }
  return { families: catalog.length, models: catalog.reduce((n, f) => n + (f.modelos?.length ?? 0), 0), expected };
}

function subdirs(dir) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory() && !/^[._]/.test(e.name) && e.name !== 'node_modules');
  } catch {
    return [];
  }
}

/** Pastas de versão em disco: todo terceiro nível sob as famílias, mais toda pasta com Chart.tsx. */
export function discoverVersionFolders() {
  const found = new Set();
  for (const family of subdirs(VISUAIS_DIR)) {
    const familyAbs = path.join(VISUAIS_DIR, family.name);
    for (const model of subdirs(familyAbs)) {
      for (const version of subdirs(path.join(familyAbs, model.name))) found.add(`${family.name}/${model.name}/${version.name}`);
    }
  }
  // findVersions a partir da raiz já pula _render (moldes), _estudo e pastas técnicas.
  for (const version of findVersions(VISUAIS_DIR)) found.add(version.rel);
  return found;
}

function cached(map, key, compute) {
  if (!map.has(key)) map.set(key, compute());
  return map.get(key);
}

/**
 * Avalia as versões sem o typecheck: devolve, por caminho relativo, a lista de motivos e os
 * detalhes de check_erro. `onDisk` é o conjunto de pastas de versão existentes.
 */
export function evaluateContract(entries, onDisk) {
  const modelReadmes = new Map();
  const familyReadmes = new Map();
  const reviews = new Map();
  const versionsByModel = new Map();
  for (const rel of onDisk) {
    const modelRel = rel.split('/').slice(0, -1).join('/');
    versionsByModel.set(modelRel, [...(versionsByModel.get(modelRel) ?? []), rel.split('/').at(-1)]);
  }
  const results = new Map();
  for (const item of entries) {
    const modelAbs = path.dirname(item.abs);
    const familyAbs = path.dirname(modelAbs);
    const motivos = new Set();
    const erros = [];
    const hasModelReadme = fs.existsSync(path.join(modelAbs, 'README.md'));
    if (!hasModelReadme) motivos.add('sem_readme_modelo');
    if (!fs.existsSync(item.abs)) {
      motivos.add('sem_pasta');
      results.set(item.rel, { ...item, motivos, erros, exists: false });
      continue;
    }
    const has = (name) => fs.existsSync(path.join(item.abs, name));
    if (!has('Chart.tsx')) motivos.add('sem_chart');
    if (!has('data.ts')) motivos.add('sem_data');
    if (!has('meta.json')) motivos.add('sem_meta');
    if (!has('preview.svg')) motivos.add('sem_preview');
    if (!has('preview-claro.svg')) motivos.add('sem_preview_claro');

    const contract = checkVersion({ abs: item.abs, rel: item.rel });
    erros.push(...contract.errors.filter((text) => !COVERED_ERROR.test(text)));
    if (hasModelReadme) {
      const modelRel = relToVisuais(modelAbs);
      const readme = cached(modelReadmes, modelAbs, () => checkModelReadme(modelAbs, versionsByModel.get(modelRel) ?? []));
      erros.push(...readme.errors.map((text) => `README do modelo: ${text}`));
    }
    const familyReadme = cached(familyReadmes, familyAbs, () => checkFamilyReadme(familyAbs));
    erros.push(...familyReadme.errors.map((text) => `README da família: ${text}`));

    const modelReviews = cached(reviews, modelAbs, () => readReviews(item.family, item.model));
    const review = reviewProblem(modelReviews, item.versionName, fingerprint(item.abs).sha1);
    if (review) motivos.add(review);
    results.set(item.rel, { ...item, motivos, erros, exists: true });
  }
  return results;
}

/** Aplica os erros de tipo e fecha os motivos na ordem canônica. */
export function finalize(results, typeInfo) {
  for (const result of results.values()) {
    const typeErrors = typeInfo?.byVersion.get(result.abs) ?? [];
    result.erros.push(...typeErrors);
    if (result.erros.length) result.motivos.add('check_erro');
    result.motivos = MOTIVOS.filter((motivo) => result.motivos.has(motivo));
  }
  return results;
}
