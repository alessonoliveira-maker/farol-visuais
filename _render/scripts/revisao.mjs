/**
 * npm run revisao -- <familia>/<modelo>/<versao> aprovado|reprovado "nota"
 *
 * Registra o veredito da revisão humana (CHECKLIST_REVISAO.md) em
 * `_render/.qa/revisao/<familia>__<modelo>.json`, com a impressão digital (sha1) do conteúdo atual
 * de Chart.tsx, data.ts e meta.json. Mudou um dos três depois, o `npm run pendencias` acusa
 * `revisao_desatualizada`. Não abre navegador nem compilador, então não entra na trava pesada.
 */
import fs from 'node:fs';
import path from 'node:path';

import { VERDICTS, recordReview } from './lib/revisao.mjs';
import { NAME_PATTERNS, VISUAIS_DIR, parseArgs, relToVisuais, resolveTarget } from './lib/paths.mjs';

const USAGE = 'Uso: npm run revisao -- <familia>/<modelo>/<versao> aprovado|reprovado "nota"';

function inCatalog(family, model, versionName) {
  try {
    const catalog = JSON.parse(fs.readFileSync(path.join(VISUAIS_DIR, '_estudo', 'catalogo.json'), 'utf8'));
    return catalog.some((f) => f.slug === family && f.modelos.some((m) => m.slug === model && m.versoes.some((v) => v.slug === versionName)));
  } catch {
    return false;
  }
}

async function main() {
  const { positional } = parseArgs(process.argv.slice(2));
  const [target, verdictArg, ...noteParts] = positional;
  if (!target || !verdictArg) {
    console.error(USAGE);
    return 2;
  }
  const verdict = verdictArg.toLowerCase();
  if (!VERDICTS.includes(verdict)) {
    console.error(`Veredito inválido: "${verdictArg}". ${USAGE}`);
    return 2;
  }
  const note = noteParts.join(' ').trim();
  if (verdict === 'reprovado' && note.length < 3) {
    console.error('Veredito reprovado exige nota dizendo o que corrigir.');
    return 2;
  }

  const abs = resolveTarget(target);
  const rel = relToVisuais(abs);
  const parts = rel.split('/');
  if (parts.length !== 3 || parts[0].startsWith('_')) {
    console.error(`Informe uma versão do catálogo (<familia>/<modelo>/<versao>), achado "${rel}".`);
    return 2;
  }
  const [family, model, versionName] = parts;
  if (!NAME_PATTERNS.family.test(family) || !NAME_PATTERNS.model.test(model) || !NAME_PATTERNS.version.test(versionName)) {
    console.error(`Nomes fora do padrão NN_slug/NN_slug/vN_slug: "${rel}".`);
    return 2;
  }
  const missing = ['Chart.tsx', 'data.ts', 'meta.json'].filter((name) => !fs.existsSync(path.join(abs, name)));
  if (missing.length) {
    console.error(`Nada para revisar ainda: faltam ${missing.join(', ')} em ${rel}.`);
    return 1;
  }
  if (!inCatalog(family, model, versionName)) {
    console.warn(`[revisao] aviso: ${rel} não está em _estudo/catalogo.json (conta como extra no levantamento).`);
  }

  const { file, entry } = await recordReview({ family, model, versionName, versionAbs: abs, verdict, note });
  console.log(`[revisao] ${rel}: ${verdict} em ${entry.data}, impressão ${entry.impressao.slice(0, 12)}.`);
  console.log(`[revisao] gravado em ${relToVisuais(file)}.`);
  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch((error) => {
    console.error(`[revisao] ${error.message}`);
    process.exit(1);
  });
