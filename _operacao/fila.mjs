/**
 * node _operacao/fila.mjs --lote N            o que o Lote N (fila.json → lotes) tem para fazer HOJE
 * node _operacao/fila.mjs --so <alvo>,<alvo>  o mesmo, para uma lista de modelos
 * node _operacao/fila.mjs [--proximos N] [--faixa produzir|revisar|corrigir|todas] [--resumo] [--json]
 *
 * Diz à sessão orquestradora O QUE VEM A SEGUIR, sem que ela leia o catálogo. Junta duas fontes:
 *
 *   - `_render/.qa/pendencias.json`, gravado por `npm run pendencias` (o ESTADO: o que existe no
 *     disco, o que passou no check, o que tem veredito);
 *   - `_operacao/fila.json`, escrito pelo dono (a ORDEM de produção dos modelos vazios, o modelo-guia
 *     de cada um, o LLM sugerido e a nota do dono).
 *
 * Saída: por faixa, a contagem e os próximos N itens, cada um com o PROMPT pronto para o agente. A
 * sessão copia a linha e lança o agente; ela não interpreta pendência nenhuma.
 *
 * Faixas, pela combinação de motivos do `pendencias`:
 *   corrigir  modelo com `revisao_reprovada` ou `check_erro` em alguma versão  -> visuais-corretor, depois visuais-revisor
 *   revisar   modelo cujos motivos são só `sem_revisao` e `revisao_desatualizada` -> visuais-revisor
 *   produzir  modelo com `sem_pasta` (nenhuma ou parte das versões no disco)     -> visuais-produtor
 *
 * Não escreve nada. Não é ferramenta do `_render` e não entra no `selftest`; vive em `_operacao/`
 * porque é do orquestrador, não do produtor.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const OP_DIR = path.dirname(fileURLToPath(import.meta.url));
const VISUAIS = path.dirname(OP_DIR);
const PENDENCIAS = path.join(VISUAIS, '_render', '.qa', 'pendencias.json');
const FILA = path.join(OP_DIR, 'fila.json');
const MAX_IDADE_H = 12;

function parseArgs(argv) {
  const out = { proximos: 3, faixa: 'todas', resumo: false, json: false, lote: null, so: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--proximos') out.proximos = Number(argv[++i]);
    else if (a === '--faixa') out.faixa = String(argv[++i]);
    else if (a === '--resumo') out.resumo = true;
    else if (a === '--json') out.json = true;
    else if (a === '--lote') out.lote = Number(argv[++i]);
    else if (a === '--so') out.so = String(argv[++i]).split(',').map((s) => s.trim()).filter(Boolean);
    else throw new Error(`argumento desconhecido: ${a}`);
  }
  if (out.lote !== null && (!Number.isInteger(out.lote) || out.lote < 1)) throw new Error('--lote exige inteiro >= 1');
  if (!Number.isInteger(out.proximos) || out.proximos < 0) throw new Error('--proximos exige inteiro >= 0');
  if (!['produzir', 'revisar', 'corrigir', 'todas'].includes(out.faixa)) throw new Error('--faixa: produzir|revisar|corrigir|todas');
  return out;
}

function lerJson(arquivo, oQue) {
  if (!fs.existsSync(arquivo)) throw new Error(`${oQue} não existe: ${arquivo}`);
  return JSON.parse(fs.readFileSync(arquivo, 'utf8'));
}

function idadeHoras(iso) {
  return (Date.now() - new Date(iso).getTime()) / 3_600_000;
}

/** Os quatro números que o README manda distinguir antes de citar qualquer um. */
function resumo(p) {
  const planejadas = p.catalogo.versoes;
  const semPasta = p.porMotivo.sem_pasta ?? 0;
  const modelosComVazio = new Set(p.versoes.filter((v) => v.motivos.includes('sem_pasta')).map((v) => `${v.familia}/${v.modelo}`)).size;
  return {
    geradoEm: p.geradoEm,
    versoes_planejadas: planejadas,
    versoes_no_disco: planejadas - semPasta,
    versoes_prontas: p.prontas,
    modelos_total: p.catalogo.modelos,
    modelos_completos: p.catalogo.modelos - modelosComVazio,
    modelos_vazios_ou_parciais: modelosComVazio,
    por_motivo: p.porMotivo,
  };
}

function classificar(p, fila) {
  const porModelo = new Map();
  for (const v of p.versoes) {
    const k = `${v.familia}/${v.modelo}`;
    const m = porModelo.get(k) ?? { alvo: k, motivos: new Set(), versoes: [] };
    m.versoes.push({ versao: v.versao, motivos: v.motivos, erros: v.erros ?? [] });
    v.motivos.forEach((x) => m.motivos.add(x));
    porModelo.set(k, m);
  }
  const SO_VEREDITO = new Set(['sem_revisao', 'revisao_desatualizada']);
  const corrigir = [];
  const revisar = [];
  const produzir = [];
  for (const m of porModelo.values()) {
    const mot = [...m.motivos];
    if (mot.some((x) => x === 'revisao_reprovada' || x === 'check_erro')) corrigir.push(m);
    else if (mot.some((x) => x === 'sem_pasta')) produzir.push(m);
    else if (mot.length && mot.every((x) => SO_VEREDITO.has(x))) revisar.push(m);
    else if (mot.length) produzir.push(m); // sem_chart, sem_data, sem_meta, sem_preview...: falta peça, é do produtor
  }
  // Produção segue a ORDEM da fila.json; modelo fora da fila vai para o fim, por slug.
  const ordem = new Map(fila.producao.map((x) => [x.alvo, x]));
  produzir.sort((a, b) => {
    const oa = ordem.get(a.alvo)?.ordem ?? 10_000;
    const ob = ordem.get(b.alvo)?.ordem ?? 10_000;
    return oa - ob || a.alvo.localeCompare(b.alvo);
  });
  corrigir.sort((a, b) => a.alvo.localeCompare(b.alvo));
  revisar.sort((a, b) => a.alvo.localeCompare(b.alvo));
  return { corrigir, revisar, produzir, ordem };
}

function itemProduzir(m, ordem, regras) {
  const f = ordem.get(m.alvo);
  const faltam = m.versoes.filter((v) => v.motivos.includes('sem_pasta')).map((v) => v.versao);
  const parcial = faltam.length !== m.versoes.length;
  const llm = f?.llm ?? regras.llm_produtor_padrao;
  const escopo = regras.versoes_por_modelo === 'v1' && !parcial ? 'só a primeira versão do catálogo; as outras vão declaradas no README (VER-1)' : `todas as que faltam (${faltam.length} de ${m.versoes.length})`;
  const guia = f?.guia?.length ? f.guia.join(' e ') : parcial ? 'a irmã já no disco' : 'o molde de _render/exemplos mais próximo';
  const nota = f?.nota ? ` Nota do dono: ${f.nota}` : '';
  const prompt = `Modelo: ${m.alvo}. Versões: ${escopo}. Guia: ${guia}.${nota}`;
  return { faixa: 'produzir', alvo: m.alvo, agente: 'visuais-produtor', llm, versoes_faltantes: faltam, parcial, guia: f?.guia ?? [], nota: f?.nota ?? '', prompt };
}

function itemRevisar(m, regras) {
  const vs = m.versoes.map((v) => `${v.versao} (${v.motivos.join(', ')})`).join('; ');
  return { faixa: 'revisar', alvo: m.alvo, agente: 'visuais-revisor', llm: regras.llm_revisor, versoes: m.versoes.map((v) => v.versao), prompt: `Modelo: ${m.alvo}. Versões a julgar: ${vs}.` };
}

function itemCorrigir(m, regras) {
  const vs = m.versoes.filter((v) => v.motivos.some((x) => x === 'revisao_reprovada' || x === 'check_erro'));
  const desc = vs.map((v) => `${v.versao} (${v.motivos.filter((x) => x === 'revisao_reprovada' || x === 'check_erro').join(', ')})`).join('; ');
  return { faixa: 'corrigir', alvo: m.alvo, agente: 'visuais-corretor', llm: regras.llm_corretor, versoes: vs.map((v) => v.versao), depois: 'visuais-revisor', prompt: `Modelo: ${m.alvo}. Versões reprovadas ou com erro de check: ${desc}. A nota de recusa está em _render/.qa/revisao/${m.alvo.replace('/', '__')}.json.` };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const p = lerJson(PENDENCIAS, 'pendencias.json (rode `npm run pendencias -- --sem-tipos` em _render)');
  const fila = lerJson(FILA, 'fila.json');
  const idade = idadeHoras(p.geradoEm);
  const aviso = idade > MAX_IDADE_H ? `ATENÇÃO: pendencias.json tem ${idade.toFixed(1)} h; regenere com \`npm run pendencias -- --sem-tipos\` antes de lançar agentes.` : null;

  const r = resumo(p);
  if (args.resumo) {
    if (args.json) return void process.stdout.write(`${JSON.stringify({ aviso, resumo: r }, null, 2)}\n`);
    if (aviso) console.log(aviso);
    console.log(`[fila] pendencias.json de ${p.geradoEm}`);
    console.log(`[fila] versões planejadas ${r.versoes_planejadas}; no disco ${r.versoes_no_disco}; prontas (check e veredito) ${r.versoes_prontas}; modelos completos ${r.modelos_completos} de ${r.modelos_total}; vazios ou parciais ${r.modelos_vazios_ou_parciais}.`);
    console.log(`[fila] por motivo: ${Object.entries(r.por_motivo).filter(([, n]) => n).map(([k, n]) => `${k} ${n}`).join(', ') || 'nenhum'}.`);
    return;
  }

  const { corrigir, revisar, produzir, ordem } = classificar(p, fila);
  const faixas = {
    corrigir: corrigir.map((m) => itemCorrigir(m, fila.regras)),
    revisar: revisar.map((m) => itemRevisar(m, fila.regras)),
    produzir: produzir.map((m) => itemProduzir(m, ordem, fila.regras)),
  };

  // --lote N ou --so a,b: o estado ATUAL de uma lista fixa de modelos, cada um na faixa em que está hoje.
  // Modelo sem pendência sai como "pronto" e a sessão o pula; é assim que o lote sobrevive a reentrada.
  if (args.lote !== null || args.so) {
    const porAlvo = new Map();
    for (const f of ['corrigir', 'revisar', 'produzir']) for (const it of faixas[f]) porAlvo.set(it.alvo, it);
    const noCatalogo = new Set(p.versoes.map((v) => `${v.familia}/${v.modelo}`).concat(p.prontasLista.map((r) => r.split('/').slice(0, 2).join('/'))));
    let lote = null;
    let alvos = args.so ?? [];
    if (args.lote !== null) {
      lote = (fila.lotes ?? []).find((l) => l.n === args.lote);
      if (!lote) throw new Error(`lote ${args.lote} não existe em fila.json (há ${fila.lotes?.length ?? 0})`);
      alvos = lote.modelos ?? [];
    }
    const itens = alvos.map((a) => porAlvo.get(a) ?? { faixa: noCatalogo.has(a) ? 'pronto' : 'desconhecido', alvo: a, agente: null, llm: null, prompt: null });
    const manuais = lote?.manuais ?? [];
    const out = { aviso, geradoEm: p.geradoEm, lote: lote ? { n: lote.n, tipo: lote.tipo, regra: lote.regra, itens_ferramenta: lote.itens ?? [] } : null, itens, manuais };
    if (args.json) return void process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
    if (aviso) console.log(aviso);
    if (lote) {
      console.log(`[fila] Lote ${lote.n} · ${lote.tipo} · ${lote.regra}`);
      if (lote.itens?.length) console.log(`[fila] itens de ferramenta: ${lote.itens.join(', ')}; o texto de cada um (Escopo e Aceite) está em PLAN.md, Fase 0.`);
    }
    const pendentes = itens.filter((it) => it.prompt);
    if (alvos.length) console.log(`[fila] ${alvos.length} modelo(s) no lote; ${pendentes.length} com trabalho hoje, ${itens.length - pendentes.length} pronto(s) ou fora do catálogo.`);
    for (const it of itens) {
      if (!it.prompt) console.log(`- ${it.alvo}: ${it.faixa}`);
      else {
        console.log(`- ${it.alvo}: ${it.faixa}  agente: ${it.agente}  llm: ${it.llm}${it.depois ? `  depois: ${it.depois}` : ''}`);
        console.log(`  prompt: ${it.prompt}`);
      }
    }
    for (const m of manuais) {
      console.log(`- ${m.alvo}: manual  agente: ${m.agente}  llm: ${m.llm}`);
      console.log(`  prompt: ${m.prompt}`);
    }
    return;
  }
  const escolhidas = args.faixa === 'todas' ? ['corrigir', 'revisar', 'produzir'] : [args.faixa];
  const saida = { aviso, geradoEm: p.geradoEm, resumo: r, regras: fila.regras, contagem: Object.fromEntries(Object.entries(faixas).map(([k, v]) => [k, v.length])), proximos: {} };
  for (const f of escolhidas) saida.proximos[f] = faixas[f].slice(0, args.proximos);

  if (args.json) return void process.stdout.write(`${JSON.stringify(saida, null, 2)}\n`);
  if (aviso) console.log(aviso);
  console.log(`[fila] pendencias.json de ${p.geradoEm}. Regras: versões por modelo = ${fila.regras.versoes_por_modelo}; pool produzir ${fila.regras.pool.produzir}, revisar ${fila.regras.pool.revisar}.`);
  console.log(`[fila] modelos por faixa: corrigir ${faixas.corrigir.length}, revisar ${faixas.revisar.length}, produzir ${faixas.produzir.length}.`);
  for (const f of escolhidas) {
    console.log(`\n## ${f} (${faixas[f].length} no total; próximos ${Math.min(args.proximos, faixas[f].length)})`);
    for (const it of saida.proximos[f]) {
      console.log(`- agente: ${it.agente}  llm: ${it.llm}${it.depois ? `  depois: ${it.depois}` : ''}`);
      console.log(`  prompt: ${it.prompt}`);
    }
  }
}

try {
  main();
} catch (e) {
  console.error(`[fila] ${e.message}`);
  process.exit(1);
}
