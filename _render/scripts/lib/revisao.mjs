/**
 * Veredito de revisão humana por versão, gravado em `_render/.qa/revisao/<familia>__<modelo>.json`.
 *
 * Cada veredito carrega a impressão digital (sha1) do conteúdo de Chart.tsx, data.ts e meta.json
 * no momento da revisão. Se o conteúdo mudar depois, o veredito deixa de valer: `pendencias`
 * acusa `revisao_desatualizada`. O preview não entra na impressão porque é derivado dos três.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { QA_DIR, ensureDir, writeFileAtomic } from './paths.mjs';

export const REVIEW_DIR = path.join(QA_DIR, 'revisao');
export const REVIEWED_FILES = ['Chart.tsx', 'data.ts', 'meta.json'];
export const VERDICTS = ['aprovado', 'reprovado'];

/** sha1 de cada arquivo e do conjunto; quebra de linha normalizada para o git não mudar a conta. */
export function fingerprint(versionAbs) {
  const total = crypto.createHash('sha1');
  const files = {};
  for (const name of REVIEWED_FILES) {
    const file = path.join(versionAbs, name);
    const content = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n') : null;
    files[name] = content === null ? null : crypto.createHash('sha1').update(content).digest('hex');
    total.update(`\n--${name}--\n`);
    total.update(content === null ? '<ausente>' : content);
  }
  return { sha1: total.digest('hex'), files };
}

export function reviewFile(family, model) {
  return path.join(REVIEW_DIR, `${family}__${model}.json`);
}

/** Lê o arquivo de vereditos de um modelo; ausente ou ilegível devolve estrutura vazia. */
export function readReviews(family, model) {
  const file = reviewFile(family, model);
  try {
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (raw && typeof raw === 'object' && raw.versoes && typeof raw.versoes === 'object') return raw;
  } catch {
    // Sem revisão ainda, ou arquivo corrompido: tratado como sem revisão.
  }
  return { familia: family, modelo: model, versoes: {}, historico: [] };
}

/** Estado da revisão de uma versão contra a impressão atual: null quando está aprovada e em dia. */
export function reviewProblem(reviews, versionName, currentSha1) {
  const entry = reviews.versoes?.[versionName];
  if (!entry) return 'sem_revisao';
  if (entry.impressao !== currentSha1) return 'revisao_desatualizada';
  if (entry.veredito !== 'aprovado') return 'revisao_reprovada';
  return null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Trava curta por arquivo de modelo (mkdir atômico). Não usa a trava pesada da ferramenta, para
 * um veredito não esperar um render de dez minutos; só impede dois revisores de perderem escrita.
 */
async function withReviewLock(file, fn) {
  const lockDir = `${file}.lock`;
  ensureDir(path.dirname(file));
  const started = Date.now();
  for (;;) {
    try {
      fs.mkdirSync(lockDir);
      break;
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      try {
        if (Date.now() - fs.statSync(lockDir).mtimeMs > 30_000) fs.rmSync(lockDir, { recursive: true, force: true });
      } catch {
        // Liberada entre as duas chamadas.
      }
      if (Date.now() - started > 120_000) throw new Error(`trava de revisão presa: ${lockDir}`);
      await sleep(150);
    }
  }
  try {
    return await fn();
  } finally {
    fs.rmSync(lockDir, { recursive: true, force: true });
  }
}

/** Registra o veredito (substitui o vigente da versão e acrescenta ao histórico). */
export async function recordReview({ family, model, versionName, versionAbs, verdict, note }) {
  const file = reviewFile(family, model);
  return withReviewLock(file, async () => {
    const reviews = readReviews(family, model);
    const print = fingerprint(versionAbs);
    const now = new Date();
    const entry = {
      veredito: verdict,
      nota: note,
      data: now.toISOString().slice(0, 10),
      registradoEm: now.toISOString(),
      impressao: print.sha1,
      arquivos: print.files,
    };
    reviews.familia = family;
    reviews.modelo = model;
    reviews.versoes[versionName] = entry;
    reviews.historico = Array.isArray(reviews.historico) ? reviews.historico : [];
    reviews.historico.push({ versao: versionName, ...entry });
    writeFileAtomic(file, `${JSON.stringify(reviews, null, 2)}\n`);
    return { file, entry };
  });
}
