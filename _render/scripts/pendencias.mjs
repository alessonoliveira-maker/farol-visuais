/**
 * npm run pendencias [-- --sem-tipos]
 *
 * Para cada versão esperada em `_estudo/catalogo.json`, diz por que ela ainda não está pronta:
 * sem_pasta, sem_chart, sem_data, sem_meta, sem_preview, sem_preview_claro, check_erro,
 * sem_readme_modelo, sem_revisao, revisao_reprovada, revisao_desatualizada. Pasta de versão fora do
 * catálogo entra em `extras`. Os moldes de `_render/exemplos` ficam de fora.
 *
 * Carga: o contrato roda sem trava (só leitura de arquivo); o typecheck roda UMA vez para todas as
 * versões com Chart.tsx e data.ts, dentro da trava entre processos, como no `check`.
 * Grava `_render/.qa/pendencias.json` e imprime um resumo curto.
 */
import path from 'node:path';

import { withLock } from './lib/lock.mjs';
import { CATALOG_FILE, MOTIVOS, discoverVersionFolders, evaluateContract, finalize, loadCatalog } from './lib/pendencias.mjs';
import { QA_DIR, parseArgs, relToVisuais, writeFileAtomic } from './lib/paths.mjs';
import { typecheck } from './lib/typecheck.mjs';

const OUTPUT = path.join(QA_DIR, 'pendencias.json');

function asEntry(rel, root) {
  const parts = rel.split('/');
  return { family: parts.at(-3) ?? '', model: parts.at(-2) ?? '', versionName: parts.at(-1) ?? '', rel, abs: path.join(root, ...parts) };
}

async function main() {
  const { flags } = parseArgs(process.argv.slice(2));
  const started = Date.now();
  const catalog = loadCatalog();
  const expectedRels = new Set(catalog.expected.map((item) => item.rel));
  const onDisk = discoverVersionFolders();
  const root = path.dirname(path.dirname(CATALOG_FILE));
  const extras = [...onDisk].filter((rel) => !expectedRels.has(rel)).sort().map((rel) => asEntry(rel, root));

  const results = evaluateContract([...catalog.expected, ...extras], onDisk);
  const typeable = [...results.values()].filter((r) => r.exists && !r.motivos.has('sem_chart') && !r.motivos.has('sem_data'));
  let typeInfo = null;
  if (!flags['sem-tipos'] && typeable.length) {
    typeInfo = await withLock(`pendencias (${typeable.length} versões)`, async () => typecheck(typeable));
  }
  finalize(results, typeInfo);

  const view = (r) => ({ caminho: r.rel, familia: r.family, modelo: r.model, versao: r.versionName, motivos: r.motivos, erros: r.erros });
  const versoes = catalog.expected.map((item) => results.get(item.rel));
  const pendentes = versoes.filter((r) => r.motivos.length);
  const porMotivo = Object.fromEntries(MOTIVOS.map((m) => [m, versoes.filter((r) => r.motivos.includes(m)).length]));

  const modelos = new Map();
  for (const r of versoes) {
    const key = `${r.family}/${r.model}`;
    const model = modelos.get(key) ?? { familia: r.family, modelo: r.model, esperadas: 0, pendentes: 0, motivos: new Set() };
    model.esperadas += 1;
    if (r.motivos.length) {
      model.pendentes += 1;
      r.motivos.forEach((m) => model.motivos.add(m));
    }
    modelos.set(key, model);
  }
  const modelosPendentes = [...modelos.values()]
    .filter((m) => m.pendentes)
    .map((m) => ({ ...m, motivos: MOTIVOS.filter((x) => m.motivos.has(x)) }));

  const report = {
    geradoEm: new Date().toISOString(),
    catalogo: { familias: catalog.families, modelos: catalog.models, versoes: versoes.length },
    prontas: versoes.length - pendentes.length,
    pendentes: pendentes.length,
    porMotivo,
    tipos: typeInfo ? { versoes: typeable.length, ms: typeInfo.ms, foraDasVersoes: typeInfo.outside } : null,
    modelos: modelosPendentes,
    versoes: pendentes.map(view),
    prontasLista: versoes.filter((r) => !r.motivos.length).map((r) => r.rel),
    extras: extras.map((item) => view(results.get(item.rel))),
  };
  writeFileAtomic(OUTPUT, `${JSON.stringify(report, null, 2)}\n`);

  const fmt = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });
  const motivoLine = Object.entries(porMotivo).filter(([, n]) => n).map(([m, n]) => `${m} ${n}`).join(', ') || 'nenhum';
  const typeNote = flags['sem-tipos'] ? 'tipos pulados (--sem-tipos)' : typeInfo ? `tipos de ${typeable.length} versões em ${fmt.format(typeInfo.ms / 1000)} s` : 'nenhuma versão para typecheck';
  console.log(`[pendencias] catálogo: ${catalog.families} famílias, ${catalog.models} modelos, ${versoes.length} versões.`);
  console.log(`[pendencias] prontas ${report.prontas}; pendentes ${report.pendentes}; modelos com pendência ${modelosPendentes.length}; extras ${extras.length}.`);
  console.log(`[pendencias] por motivo: ${motivoLine}.`);
  if (typeInfo?.outside.length) console.log(`[pendencias] atenção: ${typeInfo.outside.length} erro(s) de tipo fora das versões (Farol ou configuração).`);
  console.log(`[pendencias] ${typeNote}; total ${fmt.format((Date.now() - started) / 1000)} s. Detalhe em ${relToVisuais(OUTPUT)}.`);
  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch((error) => {
    console.error(`[pendencias] ${error.message}`);
    process.exit(1);
  });
