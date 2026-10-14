/**
 * npm run check -- <caminho relativo a VISUAIS> [outro caminho...] [--sem-tipos] [--json]
 *
 * Aceita um ou mais alvos na mesma chamada, na ordem dada; as flags valem para todos. Alvo que nao
 * existe e falha explicita e nao aborta os demais.
 *
 * 1. Contrato (rápido, sem trava): nomes, arquivos, meta.json, carimbo do preview, imports, cor,
 *    determinismo, acessibilidade mínima, escrita, READMEs de modelo e de família.
 * 2. Tipos (pesado, dentro da trava): um programa TypeScript só para todas as versões do caminho,
 *    com as opções do `app/tsconfig.json` (strict, noUncheckedIndexedAccess e as demais), mais
 *    uma sonda por versão que monta `<Chart />` sem props e `<Chart data={data} />`: prop
 *    obrigatória ou `data` incompatível com o `data.ts` viram erro de tipo.
 *
 * No fim, a cobertura sai das duas formas, que não são a mesma: uma linha por guarda com quantas
 * versões ela mediu, e uma linha por versão com as guardas que não a mediram e o motivo de cada uma.
 * A segunda responde "qual das minhas versões preciso medir à mão"; nomeia até 12 versões por
 * chamada e diz quantas ficaram sem nomear, para a varredura do acervo continuar legível.
 *
 * `--json` troca o texto por um objeto JSON no stdout (mensagens da trava vão para o stderr), com o
 * mesmo código de saída. Para stdout limpo pelo npm: `npm run --silent check -- <caminho> --json`.
 */
import fs from 'node:fs';
import path from 'node:path';

import { checkFamilyReadme, checkModelReadme, checkVersion } from './lib/contract.mjs';
import { guardaRaioContraArea, lerEscapes } from './lib/guardas.mjs';
import { withLock } from './lib/lock.mjs';
import { parseArgs, planTargets, relToVisuais } from './lib/paths.mjs';
import { typecheck } from './lib/typecheck.mjs';

/**
 * A RAIO-CONTRA-AREA (GEO-3) somada ao resultado de `checkVersion`, com a mesma forma das outras
 * guardas de preview: erros, avisos, escapes usados e a medição na chave `are`.
 *
 * ELA É CHAMADA DAQUI, e não de dentro de `checkVersion`, porque o item que a criou (F0.4, 2026-10-02)
 * tinha `contract.mjs` fora do escopo. A consequência é declarada: quem chama `checkVersion` direto
 * (`lib/pendencias.mjs`) não vê esta guarda. O lugar dela é a fila das outras, em `checkVersion`; a
 * assinatura é a mesma (`versionAbs`, escapes do `Chart.tsx`, `rel`) para a mudança ser uma linha.
 */
function comRaioContraArea(version, resultado) {
  const chartFile = path.join(version.abs, 'Chart.tsx');
  const chartText = fs.existsSync(chartFile) ? fs.readFileSync(chartFile, 'utf8') : '';
  const area = guardaRaioContraArea(version.abs, lerEscapes(chartText, 'Chart.tsx'), version.rel);
  return {
    ...resultado,
    errors: [...resultado.errors, ...area.errors],
    warnings: [...resultado.warnings, ...area.warnings],
    escapes: [...(resultado.escapes ?? []), ...area.usados.map((item) => `Chart.tsx ${item}`)],
    are: area.medicao,
  };
}

async function main() {
  const { positional, flags } = parseArgs(process.argv.slice(2), { booleanFlags: ['json', 'sem-tipos'] });
  const asJson = Boolean(flags.json);
  const { targets, versions } = planTargets(positional);
  const scope = targets.map((t) => t.scope).join(' ') || '.';
  // Uma linha por alvo pedido, antes do trabalho pesado: o alvo que não resolveu aparece aqui com o
  // caminho e o motivo, em vez de sumir calado como sumia quando só `positional[0]` era lido.
  if (!asJson) {
    for (const [i, t] of targets.entries()) {
      if (t.motivo) console.log(`[check] alvo ${i + 1}/${targets.length} ${t.arg}: FALHOU; ${t.motivo}`);
      else console.log(`[check] alvo ${i + 1}/${targets.length} ${t.scope}: ${t.versions.length} versão(ões).`);
    }
  }
  // Alvo com falha: o que não resolveu e o que resolveu sem nenhuma versão. O segundo já era falha
  // quando o comando aceitava um alvo só (saía com 1), e continua sendo.
  const targetReport = targets.map((t) => ({
    caminho: t.arg,
    escopo: t.scope,
    versoes: t.versions.length,
    falhou: Boolean(t.motivo) || t.versions.length === 0,
    motivo: t.motivo,
  }));
  const targetFailures = targetReport.filter((t) => t.falhou).length;
  if (versions.length === 0) {
    if (asJson) process.stdout.write(`${JSON.stringify({ escopo: scope, alvos: targetReport, alvosComFalha: targetFailures, versoes: [], readmes: [], falhas: 0, avisos: 0 })}\n`);
    else {
      console.log(`Nenhuma versão (pasta com Chart.tsx) sob ${scope}.`);
      console.log(`[check] ${targets.length} alvo(s) pedido(s): 0 processado(s), ${targetFailures} com falha.`);
    }
    return 1;
  }

  const results = new Map(versions.map((version) => [version.abs, comRaioContraArea(version, checkVersion(version))]));

  // READMEs: cada modelo e cada família que tem versão sob o caminho.
  const readmeResults = [];
  const models = new Map();
  for (const version of versions) {
    const modelAbs = path.dirname(version.abs);
    const list = models.get(modelAbs) ?? [];
    list.push(path.basename(version.abs));
    models.set(modelAbs, list);
  }
  for (const [modelAbs, names] of models) readmeResults.push({ label: relToVisuais(modelAbs), ...checkModelReadme(modelAbs, names) });
  for (const familyAbs of new Set([...models.keys()].map((m) => path.dirname(m)))) {
    readmeResults.push({ label: relToVisuais(familyAbs), ...checkFamilyReadme(familyAbs) });
  }

  let typeInfo = null;
  if (!flags['sem-tipos']) {
    const originalLog = console.log;
    if (asJson) console.log = console.error;
    try {
      typeInfo = await withLock(`check ${scope}`, async () => typecheck(versions));
    } finally {
      console.log = originalLog;
    }
    for (const [abs, list] of typeInfo.byVersion) results.get(abs)?.errors.push(...list);
  }

  let failures = 0;
  let warningCount = 0;
  let escapeCount = 0;
  /**
   * Cobertura de cada guarda que MEDE o desenho ou o código: quantas versões ela conseguiu medir e
   * por que motivo as demais ficaram de fora. Existe porque "0 com erro" não quer dizer nada quando a
   * guarda ficou cega: marca em HTML, preview girado e versão sem texto não são versões aprovadas.
   * A chave é a mesma que `checkVersion` devolve, e o rótulo é o que aparece no relatório.
   */
  const COBERTURA = [
    ['ace', 'FRASE-ACESSIVEL (ACE-1)'],
    ['esp', 'ESPESSURA-MARCA (ESP-2)'],
    ['col', 'COLISAO-TEXTO'],
    ['tam', 'TAMANHO-TEXTO (TIP-2)'],
    ['con', 'CONTRASTE-TEXTO (ACE-3)'],
    ['agr', 'AGREGACAO-ZERO (EST-1b)'],
    ['mar', 'CONTRASTE-MARCA (TOK-1, TOK-7)'],
    ['reg', 'REGUA-CONSTANTE (ROT-5b)'],
    ['fmt', 'FORMATO-ACESSIVEL (DAD-9)'],
    ['eix', 'EIXO-CALMO (EIX-5)'],
    ['opa', 'OPACIDADE-MARCA (ACE-5)'],
    ['nam', 'TEXTO-NA-MARCA (ROT-6, ROT-7b)'],
    ['are', 'RAIO-CONTRA-AREA (GEO-3)'],
  ];
  const cobertura = new Map(COBERTURA.map(([chave, rotulo]) => [chave, { rotulo, medidas: 0, foraPorMotivo: new Map() }]));
  /**
   * O mesmo buraco de cobertura, virado do outro lado: uma entrada por versão que tem guarda sem
   * medir, com a guarda e o motivo. Existe porque o agregado por guarda diz QUANTAS versões ficaram
   * de fora e nunca QUAIS, e a pergunta que o produtor faz é a segunda: é no `notes` da versão que
   * ele escreve o número medido à mão. Sem isto a saída dele era rodar o `check` de novo com alvo
   * isolado, uma execução por candidata, cada uma pegando trava e navegador.
   */
  const foraPorVersao = [];
  for (const version of versions) {
    const resultado = results.get(version.abs) ?? { errors: [], warnings: [], escapes: [] };
    const { errors, warnings, escapes } = resultado;
    warningCount += warnings.length;
    escapeCount += escapes?.length ?? 0;
    if (errors.length) failures += 1;
    const faltas = [];
    for (const [chave, dados] of cobertura) {
      const medicao = resultado[chave];
      if (medicao?.medida) dados.medidas += 1;
      else {
        const motivo = medicao?.motivo ?? 'sem_medicao';
        dados.foraPorMotivo.set(motivo, (dados.foraPorMotivo.get(motivo) ?? 0) + 1);
        faltas.push(`${dados.rotulo} ${motivo}`);
      }
    }
    if (faltas.length) foraPorVersao.push({ rel: version.rel, faltas });
  }
  for (const { errors, warnings } of readmeResults) {
    if (errors.length) failures += 1;
    warningCount += warnings.length;
  }
  if (typeInfo?.outside.length) failures += 1;

  if (asJson) {
    const report = {
      escopo: scope,
      alvos: targetReport,
      alvosComFalha: targetFailures,
      versoes: versions.map((version) => ({
        caminho: version.rel,
        erros: results.get(version.abs).errors,
        avisos: results.get(version.abs).warnings,
        escapes: results.get(version.abs).escapes ?? [],
        ...Object.fromEntries(COBERTURA.map(([chave]) => [chave, results.get(version.abs)[chave] ?? null])),
      })),
      readmes: readmeResults.map(({ label, errors, warnings }) => ({ caminho: label, erros: errors, avisos: warnings })),
      tipos: typeInfo ? { ms: typeInfo.ms, foraDasVersoes: typeInfo.outside } : null,
      modelos: models.size,
      falhas: failures,
      avisos: warningCount,
      escapes: escapeCount,
      cobertura: Object.fromEntries([...cobertura].map(([chave, dados]) => [chave, { guarda: dados.rotulo, medidas: dados.medidas, naoMedidas: Object.fromEntries(dados.foraPorMotivo) }])),
    };
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    return failures || targetFailures ? 1 : 0;
  }

  for (const version of versions) {
    const { errors, warnings, escapes } = results.get(version.abs) ?? { errors: [], warnings: [], escapes: [] };
    const mark = errors.length ? 'FALHOU' : warnings.length ? 'aviso ' : 'ok    ';
    console.log(`${mark} ${version.rel}`);
    for (const error of errors) console.log(`  erro:  ${error}`);
    for (const warning of warnings) console.log(`  aviso: ${warning}`);
    for (const escape of escapes ?? []) console.log(`  escape: ${escape}`);
  }
  for (const { label, errors, warnings } of readmeResults) {
    if (!errors.length && !warnings.length) continue;
    console.log(`${errors.length ? 'FALHOU' : 'aviso '} ${label} (README)`);
    for (const error of errors) console.log(`  erro:  ${error}`);
    for (const warning of warnings) console.log(`  aviso: ${warning}`);
  }
  if (typeInfo?.outside.length) {
    console.log('\nErros de tipo fora das versões (Farol ou configuração da ferramenta):');
    for (const text of typeInfo.outside.slice(0, 20)) console.log(`  erro:  ${text}`);
  }
  const typeNote = typeInfo ? `tipos em ${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(typeInfo.ms / 1000)} s` : 'tipos pulados (--sem-tipos)';
  console.log(`\n[check] ${targets.length} alvo(s) pedido(s): ${targets.length - targetFailures} processado(s), ${targetFailures} com falha.`);
  for (const t of targetReport.filter((t) => t.falhou)) console.log(`[check] alvo com falha: ${t.caminho}; ${t.motivo ?? 'nenhuma versão (pasta com Chart.tsx) sob o caminho'}.`);
  console.log(`[check] ${versions.length} versão(ões), ${models.size} modelo(s); ${typeNote}; ${failures} com erro, ${warningCount} aviso(s).`);
  console.log(`[check] ${escapeCount} escape(s) de guarda em uso (comentário // check-ok: CODIGO motivo).`);
  for (const [, dados] of cobertura) {
    const fora = [...dados.foraPorMotivo.entries()].map(([motivo, n]) => `${motivo} ${n}`).join(', ');
    console.log(`[check] ${dados.rotulo}: ${dados.medidas} de ${versions.length} versão(ões) medidas${fora ? `; não medidas: ${fora}` : ''}.`);
  }
  // Teto de versões nomeadas: regra única, igual em qualquer alvo; nomeia as primeiras na ordem
  // pedida e declara quantas ficaram sem nomear. Existe porque o acervo passa de 400 versões e
  // nomear todas trocaria um problema de leitura por outro; o teto sai escrito na própria linha para
  // ninguém ler "não apareceu aqui" como "essa guarda mediu".
  const TETO_VERSOES_NOMEADAS = 12;
  if (!foraPorVersao.length) {
    console.log(`[check] cobertura por versão: nenhuma das ${versions.length} versão(ões) tem guarda não medida.`);
  } else {
    const nomeadas = foraPorVersao.slice(0, TETO_VERSOES_NOMEADAS);
    const semNomear = foraPorVersao.length - nomeadas.length;
    const corte = semNomear
      ? `${nomeadas.length} nomeada(s) na ordem pedida, ${semNomear} sem nomear pelo teto de ${TETO_VERSOES_NOMEADAS} por chamada; rode o check por modelo, ou --json para todas`
      : `${nomeadas.length} nomeada(s), nenhuma sem nomear (teto de ${TETO_VERSOES_NOMEADAS} por chamada)`;
    console.log(`[check] cobertura por versão, qual medir à mão: ${foraPorVersao.length} de ${versions.length} versão(ões) com guarda não medida; ${corte}.`);
    for (const { rel, faltas } of nomeadas) console.log(`[check]   ${rel}: ${faltas.join('; ')}.`);
  }
  return failures || targetFailures ? 1 : 0;
}

main()
  .then((code) => process.exit(code))
  .catch((error) => {
    console.error(`[check] ${error.message}`);
    process.exit(1);
  });
