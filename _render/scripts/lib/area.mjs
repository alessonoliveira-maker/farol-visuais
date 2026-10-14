/**
 * Leitor de ÁREA do `preview.svg`: a fatia, o anel, o setor e a bolha, cada um com a área que foi
 * desenhada, e os vetores numéricos do `data.ts` contra os quais essa área se compara. Existe para a
 * guarda RAIO-CONTRA-AREA (GEO-3) de `guardas.mjs` e não decide nada: mede, casa a marca com o valor e
 * devolve a LEI que o desenho segue, com o desvio em pontos percentuais. Quem reprova é a guarda.
 *
 * POR QUE O SVG, E NÃO O Chart.tsx. A meia correção da GEO-3 tem a raiz quadrada escrita no código
 * (`rMin + (rMax − rMin) * Math.sqrt(v / topo)`) e passa por conserto feito em qualquer leitura de
 * fonte. O que não mente é a conta no desenho: a área de cada marca contra a participação do valor.
 *
 * O QUE ELE LÊ, medido no acervo em 2026-10-02 pela assinatura de comandos de cada `<path>` com arco:
 *   `MALZ`   fatia do Recharts (`M` no arco, `A` externo, `L` ao centro): 6 modelos de `06_pizza`.
 *   `MALAZ`  setor de anel do Recharts (`A` externo, `L`, `A` interno): 14 modelos, de `07/01` a `15/01`.
 *   `MLAZ`   fatia desenhada à mão a partir do centro (`06/03`, `14/09`).
 *   `MAA`    símbolo circular do `<Scatter>`, dois arcos de meia volta: 10 modelos.
 *   `<circle>` com preenchimento: bolha desenhada à mão (`09/04`, `12/08`, `15/08`).
 * O QUE ELE NÃO LÊ, e por isso não entra em grupo nenhum: o retângulo de canto arredondado (`MALALLZ`
 * e parentes, que têm `width` e `height`), o setor com `cornerRadius` (`MAAALAAAZ`, anel de progresso e
 * barra radial, que codificam por ângulo) e a fita curva de `11/05` (`MAQAQZ`).
 *
 * A ESCALA NÃO ATRAPALHA. A comparação é de PARTICIPAÇÃO dentro do grupo, e toda marca de um mesmo
 * `<svg>` aninhado sofre a mesma escala; `translate` e `rotate` não mudam área. Só `scale`, `matrix` e
 * `skew` na cadeia da marca a tiram da conta, e ela sai contada em `foraPorTransform`. O único grupo
 * que atravessa `<svg>` é o dos discos, e ali o raio de cada um entra com o fator do `<svg>` dele.
 *
 * COMO O VALOR É ACHADO. O `preview.svg` não carrega o valor de cada marca, então ele vem do `data.ts`,
 * que é transpilado e avaliado isolado (nenhum `data.ts` do acervo importa nada). De tudo o que ele
 * exporta saem os vetores candidatos: o campo numérico de cada lista de objetos, as listas aninhadas
 * achatadas (as folhas de uma hierarquia), cada lista aninhada por item (as fatias de UMA pizza), o
 * total por item (o anel de dentro do sunburst, o tamanho de cada pizza) e a concatenação de campos
 * (as camadas de uma rosa empilhada). A marca casa com o valor por POSTO: a menor área com o menor
 * valor. Qualquer codificação monotônica preserva o posto, a certa e a errada.
 *
 * O QUE ELE NÃO ADIVINHA. Valor que só existe depois de uma conta no `Chart.tsx` (razão entre dois
 * campos, cauda agregada em "Outros", recorte por filtro) não está no `data.ts`, e o grupo sai
 * `valor_nao_casado`. Não casar não é aprovar.
 */
import { createRequire } from 'node:module';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const TAG = /<(\/?)([a-zA-Z][a-zA-Z0-9:-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;
const ATTR = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*"([^"]*)"/g;
/** Subárvores que definem, não desenham. */
const NAO_DESENHA = new Set(['defs', 'clipPath', 'pattern', 'mask', 'marker', 'symbol']);
/** Transformação que não muda área: só estas duas passam. */
const TRANSFORM_SEM_ESCALA = /^(?:\s*(?:translate|rotate)\s*\([^)]*\)\s*,?)*\s*$/;
/** Dois centros a menos disto, em px, são o mesmo centro (o Recharts escreve o `d` com 4 casas). */
const MESMO_CENTRO = 0.75;
/** Dois raios a menos disto, em fração do maior, são o mesmo raio. */
const MESMO_RAIO = 0.002;

function lerAtributos(raw) {
  const out = {};
  for (const m of raw.matchAll(ATTR)) out[m[1]] = m[2];
  return out;
}

function lerEstilo(valor) {
  const out = {};
  for (const par of (valor ?? '').split(';')) {
    const i = par.indexOf(':');
    if (i > 0) out[par.slice(0, i).trim()] = par.slice(i + 1).trim();
  }
  return out;
}

/** O `d` em comandos absolutos `M`, `L`, `A` e `Z`; qualquer outro comando devolve `null`. */
function lerComandos(d) {
  const comandos = [];
  for (const m of String(d).matchAll(/([A-Za-z])([^A-Za-z]*)/g)) {
    if (!'MLAZz'.includes(m[1])) return null;
    const args = [...m[2].matchAll(/-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi)].map((n) => Number(n[0]));
    comandos.push({ c: m[1].toUpperCase(), args });
  }
  return comandos;
}

/**
 * Centro e abertura de um arco circular do SVG, pela parametrização da especificação (F.6.5), com
 * `rx = ry` e sem rotação. Devolve `{ cx, cy, abertura }`, a abertura em radianos e sem sinal.
 */
function arco(x1, y1, raio, grande, horario, x2, y2) {
  const dx = (x1 - x2) / 2;
  const dy = (y1 - y2) / 2;
  const meia = Math.hypot(dx, dy);
  if (meia === 0) return null;
  const r = Math.max(raio, meia);
  const fator = Math.sqrt(Math.max(0, r * r - meia * meia)) / meia * (grande === horario ? -1 : 1);
  const cx = fator * dy + (x1 + x2) / 2;
  const cy = -fator * dx + (y1 + y2) / 2;
  let delta = Math.atan2(y2 - cy, x2 - cx) - Math.atan2(y1 - cy, x1 - cx);
  if (!horario && delta > 0) delta -= 2 * Math.PI;
  if (horario && delta < 0) delta += 2 * Math.PI;
  return { cx, cy, abertura: Math.abs(delta) };
}

/** Um `<path>` como setor (`MALZ`, `MALAZ`, `MLAZ`) ou como círculo (`MAA`); `null` se não é nenhum. */
function lerForma(d, attrs) {
  const cmd = lerComandos(d);
  if (!cmd) return null;
  const assinatura = cmd.map((c) => c.c).join('');
  const arcoDe = (de, a) => (a.args.length === 7 ? arco(de[0], de[1], a.args[0], a.args[3], a.args[4], a.args[5], a.args[6]) : null);
  if (assinatura === 'MAA' || assinatura === 'MAAZ') {
    const [m, a1, a2] = cmd;
    if (a1.args.length !== 7 || a2.args.length !== 7 || Math.abs(a1.args[0] - a2.args[0]) > 1e-6) return null;
    const r = a1.args[0];
    const corda = Math.hypot(a1.args[5] - m.args[0], a1.args[6] - m.args[1]);
    if (Math.abs(corda - 2 * r) > 0.01 * r) return null;
    return { tipo: 'circulo', cx: Number(attrs.cx ?? (m.args[0] + a1.args[5]) / 2), cy: Number(attrs.cy ?? (m.args[1] + a1.args[6]) / 2), r };
  }
  let externo = null;
  let interno = 0;
  let centro = null;
  if (assinatura === 'MALZ') {
    externo = { raio: cmd[1].args[0], ...(arcoDe(cmd[0].args, cmd[1]) ?? {}) };
    centro = cmd[2].args;
  } else if (assinatura === 'MLAZ') {
    externo = { raio: cmd[2].args[0], ...(arcoDe(cmd[1].args, cmd[2]) ?? {}) };
    centro = cmd[0].args;
  } else if (assinatura === 'MALAZ') {
    const a = { raio: cmd[1].args[0], ...(arcoDe(cmd[0].args, cmd[1]) ?? {}) };
    const b = { raio: cmd[3].args[0], ...(arcoDe(cmd[2].args, cmd[3]) ?? {}) };
    if (!(a.abertura >= 0) || !(b.abertura >= 0)) return null;
    // Os dois arcos de um setor de anel têm a mesma abertura; se não têm, a forma é outra coisa.
    if (Math.abs(a.abertura - b.abertura) > 0.02) return null;
    externo = a.raio >= b.raio ? a : b;
    interno = Math.min(a.raio, b.raio);
  } else return null;
  if (!(externo.abertura >= 0) || !(externo.raio > 0)) return null;
  // O centro declarado (`cx`, `cy` do Recharts, ou o vértice do `L`) vale mais que o calculado: num arco
  // de quase volta inteira os dois extremos quase coincidem e a direção da corda perde precisão.
  const cx = Number.isFinite(Number(attrs.cx)) && attrs.cx !== undefined ? Number(attrs.cx) : (centro?.[0] ?? externo.cx);
  const cy = Number.isFinite(Number(attrs.cy)) && attrs.cy !== undefined ? Number(attrs.cy) : (centro?.[1] ?? externo.cy);
  return { tipo: 'setor', cx, cy, raio: externo.raio, interno, abertura: externo.abertura };
}

/**
 * Devolve `{ setores, circulos, foraPorTransform }`.
 * `setores`: `{ escopo, cx, cy, raio, interno, abertura, nome }`; `circulos`: `{ escopo, cx, cy, r, cor, nome }`.
 * Só entra a marca com preenchimento no estilo computado (a moldura da ferramenta usa atributo),
 * fora de `defs` e de `foreignObject`, e visível.
 */
export function lerMarcasDeArea(conteudo) {
  const svg = String(conteudo).replace(/<style>[\s\S]*?<\/style>/g, '').replace(/<!--[\s\S]*?-->/g, '');
  const pilha = [];
  const setores = [];
  const circulos = [];
  let escopos = 0;
  let foraPorTransform = 0;
  TAG.lastIndex = 0;
  let m;
  while ((m = TAG.exec(svg))) {
    const [, fecha, nome, raw, autoFecha] = m;
    if (fecha) {
      for (let i = pilha.length - 1; i >= 0; i -= 1) {
        if (pilha[i].nome === nome) {
          pilha.length = i;
          break;
        }
      }
      continue;
    }
    const attrs = lerAtributos(raw);
    const style = lerEstilo(attrs.style);
    const pai = pilha[pilha.length - 1] ?? null;
    const no = {
      nome,
      escopo: pai?.escopo ?? -1,
      fora: (pai?.fora ?? false) || nome === 'foreignObject' || NAO_DESENHA.has(nome),
      escala: (pai?.escala ?? false) || (attrs.transform !== undefined && !TRANSFORM_SEM_ESCALA.test(attrs.transform)),
    };
    no.fator = pai?.fator ?? 1;
    if (nome === 'svg') {
      no.escopo = escopos;
      escopos += 1;
      // Quanto a área deste `<svg>` aninhado encolhe ou cresce na tela. Só importa entre `<svg>`
      // diferentes (os discos de `06/06`); dentro de um só, toda marca sofre o mesmo fator.
      const vb = (attrs.viewBox ?? '').split(/[\s,]+/).map(Number);
      const [w, h] = [Number(attrs.width), Number(attrs.height)];
      if (vb.length === 4 && vb.every(Number.isFinite) && vb[2] > 0 && vb[3] > 0 && w > 0 && h > 0) {
        const [ex, ey] = [w / vb[2], h / vb[3]];
        no.fator *= attrs.preserveAspectRatio === 'none' ? ex * ey : Math.min(ex, ey) ** 2;
      }
    }
    const pintada = style.fill && style.fill !== 'none' && style.opacity !== '0' && style['fill-opacity'] !== '0' && style.visibility !== 'hidden';
    if (!no.fora && pintada && (nome === 'circle' || nome === 'path')) {
      const forma = nome === 'circle' ? { tipo: 'circulo', cx: Number(attrs.cx), cy: Number(attrs.cy), r: Number(attrs.r) } : lerForma(attrs.d ?? '', attrs);
      if (forma && no.escala) foraPorTransform += 1;
      else if (forma?.tipo === 'circulo' && forma.r > 0) circulos.push({ escopo: no.escopo, cx: forma.cx, cy: forma.cy, r: forma.r, cor: style.fill, nome: attrs.name ?? null });
      else if (forma?.tipo === 'setor') setores.push({ escopo: no.escopo, fator: no.fator, cx: forma.cx, cy: forma.cy, raio: forma.raio, interno: forma.interno, abertura: forma.abertura, nome: attrs.name ?? null });
    }
    if (!autoFecha) pilha.push(no);
  }
  return { setores, circulos, foraPorTransform };
}

// ---------------------------------------------------------------------------------------------
// Os vetores do `data.ts`
// ---------------------------------------------------------------------------------------------

/** Acima disto a lista de candidatos para de crescer: é dado de fixture, não base de produção. */
const TETO_DE_VETORES = 4000;
/** Concatenação de campos: até este número de campos numéricos por lista (2^n combinações). */
const TETO_DE_CAMPOS = 6;

const ehObjeto = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const ehNumero = (v) => typeof v === 'number' && Number.isFinite(v);

/** O total de um campo num nó: o próprio campo, ou a soma do campo nos descendentes. */
function totalDe(no, campo) {
  if (Array.isArray(no)) return no.reduce((s, item) => s + totalDe(item, campo), 0);
  if (!ehObjeto(no)) return 0;
  if (ehNumero(no[campo])) return no[campo];
  return Object.values(no).reduce((s, v) => s + (Array.isArray(v) ? totalDe(v, campo) : 0), 0);
}

/** Os nomes de campo numérico que aparecem em qualquer descendente de uma lista. */
function camposAbaixo(lista, achados = new Set(), nivel = 0) {
  if (nivel > 6) return achados;
  for (const item of lista) {
    if (!ehObjeto(item)) continue;
    for (const [k, v] of Object.entries(item)) {
      if (ehNumero(v)) achados.add(k);
      else if (Array.isArray(v)) camposAbaixo(v, achados, nivel + 1);
    }
  }
  return achados;
}

function coletarLista(lista, nome, saida, nivel) {
  if (nivel > 6 || saida.length > TETO_DE_VETORES || lista.length === 0) return;
  if (lista.every((v) => v === null || v === undefined || ehNumero(v))) {
    saida.push({ nome, valores: lista.filter(ehNumero) });
    return;
  }
  if (lista.every(Array.isArray)) {
    coletarLista(lista.flat(), `${nome}[]`, saida, nivel + 1);
    return;
  }
  if (!lista.every(ehObjeto)) return;
  const chaves = [...new Set(lista.flatMap((o) => Object.keys(o)))];
  const numericas = chaves.filter((k) => lista.some((o) => ehNumero(o[k])) && lista.every((o) => o[k] === null || o[k] === undefined || ehNumero(o[k])));
  for (const k of numericas) saida.push({ nome: `${nome}.${k}`, valores: lista.map((o) => o[k]).filter(ehNumero) });
  // As camadas de uma marca empilhada são campos irmãos: cada combinação de dois ou mais campos.
  if (numericas.length >= 2 && numericas.length <= TETO_DE_CAMPOS) {
    for (let mascara = 3; mascara < 1 << numericas.length; mascara += 1) {
      const campos = numericas.filter((_, i) => mascara & (1 << i));
      if (campos.length < 2) continue;
      saida.push({ nome: `${nome}.{${campos.join('+')}}`, valores: campos.flatMap((k) => lista.map((o) => o[k]).filter(ehNumero)) });
    }
  }
  for (const k of chaves) {
    const valores = lista.map((o) => o[k]).filter((v) => v !== null && v !== undefined);
    if (!valores.length) continue;
    if (valores.every(Array.isArray)) {
      // Achatada: as folhas de todos os itens juntas. Por item: a lista de cada um, sozinha.
      coletarLista(valores.flat(), `${nome}.${k}[]`, saida, nivel + 1);
      if (lista.length > 1) for (const [i, o] of lista.entries()) if (Array.isArray(o[k])) coletarLista(o[k], `${nome.replace(/\[\]$/, '')}[${i}].${k}[]`, saida, nivel + 1);
      for (const campo of camposAbaixo(valores.flat())) saida.push({ nome: `total de ${campo} por item de ${nome}`, valores: lista.map((o) => totalDe(o[k] ?? [], campo)) });
    } else if (valores.every(ehObjeto)) coletarLista(valores, `${nome}.${k}`, saida, nivel + 1);
  }
}

function coletar(valor, nome, saida, nivel) {
  if (nivel > 6) return;
  if (Array.isArray(valor)) coletarLista(valor, `${nome}[]`, saida, nivel);
  else if (ehObjeto(valor)) {
    const numeros = Object.entries(valor).filter(([, v]) => ehNumero(v));
    if (numeros.length >= 2) saida.push({ nome: `${nome}.{${numeros.map(([k]) => k).join(',')}}`, valores: numeros.map(([, v]) => v) });
    for (const [k, v] of Object.entries(valor)) if (v !== null && typeof v === 'object') coletar(v, `${nome}.${k}`, saida, nivel + 1);
  }
}

/**
 * Os vetores numéricos candidatos do `data.ts`: `{ vetores: [{ nome, valores }], erro }`.
 *
 * O arquivo é transpilado e avaliado num contexto vazio, sem `require`: `data.ts` é fixture, não
 * importa nada (0 de 491 no acervo), e o que importar cai em `erro` em vez de rodar. Vetor repetido,
 * com os mesmos valores, fica uma vez só, com o primeiro nome.
 */
export function lerVetoresDoDado(fonte) {
  let exportado;
  try {
    const js = ts.transpileModule(String(fonte), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
    const contexto = { exports: {}, module: { exports: {} } };
    contexto.module.exports = contexto.exports;
    vm.runInNewContext(js, contexto, { timeout: 1000 });
    exportado = contexto.module.exports;
  } catch (erro) {
    return { vetores: [], erro: String(erro?.message ?? erro).split('\n')[0] };
  }
  const brutos = [];
  // O objeto vem de outro contexto: a cópia por JSON traz listas e objetos para o deste processo.
  for (const [nome, valor] of Object.entries(JSON.parse(JSON.stringify(exportado ?? {})) ?? {})) coletar(valor, nome, brutos, 0);
  const vistos = new Set();
  const vetores = [];
  for (const v of brutos) {
    if (v.valores.length < 2) continue;
    const chave = [...v.valores].sort((a, b) => a - b).join('|');
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    vetores.push(v);
  }
  return { vetores, erro: null };
}

// ---------------------------------------------------------------------------------------------
// A lei que o desenho segue
// ---------------------------------------------------------------------------------------------

const soma = (lista) => lista.reduce((s, n) => s + n, 0);
const distintos = (lista) => new Set(lista.map((n) => n.toPrecision(9))).size;
const varia = (lista) => Math.max(...lista) - Math.min(...lista) > MESMO_RAIO * Math.max(...lista.map(Math.abs));
const emOrdem = (lista) => lista.map((_, i) => i).sort((a, b) => lista[a] - lista[b]);

/**
 * O vetor de valores que serve para `n` marcas, em ordem crescente, ou `null`.
 * Serve o vetor do mesmo tamanho, se não tem negativo (negativo não tem área), ou o que fica do mesmo
 * tamanho só com os positivos: marca de valor zero não é desenhada, e a de valor negativo, quando
 * existe, vai em outra cor (o mapa de correlação de `15/08 v3`) e forma outro grupo.
 */
function valoresPara(n, valores) {
  const usados = valores.length === n ? valores : valores.filter((v) => v > 0);
  if (usados.length !== n || usados.some((v) => v < 0)) return null;
  return [...usados].sort((a, b) => a - b);
}

/** Maior diferença, em pontos percentuais, entre a participação de cada `x` e a de cada `v`. */
function desvioDeParticipacao(x, v) {
  const sx = soma(x);
  const sv = soma(v);
  if (!(sx > 0) || !(sv > 0)) return null;
  let pp = 0;
  let i = 0;
  for (const [k, xi] of x.entries()) {
    const d = Math.abs(xi / sx - v[k] / sv) * 100;
    if (d > pp) [pp, i] = [d, k];
  }
  return { pp, i, partX: (x[i] / sx) * 100, partV: (v[i] / sv) * 100, valor: v[i] };
}

/** `x = a + b·v` por mínimos quadrados, com `b > 0` e piso `a` não negativo; o resíduo em p.p. de `x`. */
function desvioAfim(x, v) {
  const mv = soma(v) / v.length;
  const mx = soma(x) / x.length;
  const sxx = soma(v.map((n) => (n - mv) ** 2));
  if (!(sxx > 0) || !(soma(x) > 0)) return null;
  const b = soma(v.map((n, k) => (n - mv) * (x[k] - mx))) / sxx;
  const a = mx - b * mv;
  if (!(b > 0) || a < -1e-6 * mx) return null;
  return { pp: (Math.max(...x.map((xi, k) => Math.abs(xi - a - b * v[k]))) / soma(x)) * 100, piso: a };
}

/**
 * Procura, entre os vetores, o que a grandeza `y` das marcas segue dentro da tolerância.
 *
 * `afim` aceita piso (`y = a + b·v`). A reta tem dois parâmetros, então dois pontos cabem sempre e a
 * forma afim pede TRÊS valores distintos; e com três sobra um grau de liberdade só, então aí a folga
 * cai a um décimo da tolerância (a lei exata fecha em 0,00001 p.p. nos três setores de `06/05 v1`).
 * Com quatro ou mais vale a tolerância inteira. Devolve o melhor casamento, ou `null`.
 */
function casar(y, vetores, tolerancia, { afim = false, minimoDeDistintos = 1, transformar = null } = {}) {
  const ordem = emOrdem(y);
  const ys = ordem.map((i) => y[i]);
  let melhor = null;
  for (const vetor of vetores) {
    const crus = valoresPara(y.length, vetor.valores);
    if (!crus) continue;
    const n = distintos(crus);
    if (n < Math.max(minimoDeDistintos, afim ? 3 : 1)) continue;
    const v = transformar ? crus.map(transformar) : crus;
    const d = afim ? desvioAfim(ys, v) : desvioDeParticipacao(ys, v);
    if (!d || d.pp > (afim && n < 4 ? tolerancia / 10 : tolerancia)) continue;
    if (!melhor || d.pp < melhor.pp) melhor = { pp: d.pp, vetor: vetor.nome, valores: crus, ordem, piso: d.piso ?? null };
  }
  return melhor;
}

/**
 * O estrago de uma lei errada: a participação em ÁREA de cada marca contra a do valor que ela carrega.
 * Quando a lei errada tem piso de raio, a área comparada é a que fica ACIMA do piso (`r² − piso²`), que
 * é a única parte da marca que poderia acompanhar o valor: é a conta que o README de `06/05` fez à mão.
 */
function estrago(area, casamento, comPiso) {
  const piso = comPiso ? casamento.piso ** 2 : 0;
  return desvioDeParticipacao(casamento.ordem.map((i) => Math.max(0, area[i] - piso)), casamento.valores);
}

/**
 * A lei de um grupo de marcas. `area` é a grandeza que tem de ser proporcional ao valor; `erradas` são
 * as leis que a GEO-3 nomeia, cada uma com a grandeza que seria proporcional ao valor se a lei errada
 * estivesse em uso. A lei certa é procurada PRIMEIRO: com valores quase iguais a raiz é quase reta, as
 * duas cabem na tolerância, e aí o desenho está certo dentro dela.
 *
 * Lei errada só é reconhecida com TRÊS valores distintos: com dois, a razão entre dois raios casa por
 * acaso com algum par de números do dado, e a guarda reprovaria por coincidência. `area` é sempre uma
 * grandeza em px² sem o fator do ângulo (`r²` na bolha, `R² − r²` no setor), para o piso se descontar.
 */
function leiDoGrupo(area, erradas, vetores, tolerancia, { aceitaPiso = false } = {}) {
  const certa = casar(area, vetores, tolerancia) ?? (aceitaPiso ? casar(area, vetores, tolerancia, { afim: true }) : null);
  if (certa) return { lei: certa.piso === null ? 'area' : 'area_com_piso', vetor: certa.vetor, desvio: certa.pp, pior: null };
  for (const errada of erradas) {
    if (distintos(errada.y) < 3) continue;
    const achada = casar(errada.y, vetores, tolerancia, { afim: errada.comPiso ?? false, minimoDeDistintos: 3, transformar: errada.transformar ?? null });
    // Piso que não chega a 1% do menor raio é ruído do ajuste, e a lei sem piso já foi tentada antes.
    if (!achada || (errada.comPiso && !(achada.piso > 0.01 * Math.min(...errada.y)))) continue;
    const d = estrago(area, achada, errada.comPiso ?? false);
    if (!d || d.pp <= tolerancia) continue;
    return { lei: errada.lei, vetor: achada.vetor, desvio: d.pp, pior: { valor: d.valor, partValor: d.partV, partArea: d.partX, acimaDoPiso: errada.comPiso ?? false } };
  }
  return { lei: null, vetor: null, desvio: null, pior: null };
}

const px = (n) => String(Math.round(n * 10) / 10).replace('.', ',');

/** Setores de mesmo centro no mesmo `<svg>`: uma pizza, uma rosca, uma rosa, um sunburst. */
function agruparSetores(setores) {
  const grupos = [];
  for (const s of setores) {
    const grupo = grupos.find((g) => g[0].escopo === s.escopo && Math.hypot(g[0].cx - s.cx, g[0].cy - s.cy) < MESMO_CENTRO);
    if (grupo) grupo.push(s);
    else grupos.push([s]);
  }
  return grupos;
}

/** Os anéis de um grupo: setores com o mesmo raio de dentro e o mesmo de fora. */
function aneisDe(grupo) {
  const aneis = [];
  for (const s of grupo) {
    const igual = (a, b) => Math.abs(a - b) <= MESMO_RAIO * Math.max(a, b, 1);
    const anel = aneis.find((a) => igual(a[0].raio, s.raio) && igual(a[0].interno, s.interno));
    if (anel) anel.push(s);
    else aneis.push([s]);
  }
  return aneis;
}

/**
 * As leis erradas do raio de uma marca SEM FURO (bolha, fatia de raio variável, pizza inteira), na
 * ordem em que a GEO-3 as conta: o raio em linha com o valor, sem piso e com piso, e a meia correção
 * (`rMin + k·√v`), que tem a raiz escrita e não entrega área proporcional.
 */
function leisErradasSemFuro(raios) {
  return [
    { lei: 'raio_linear', y: raios },
    { lei: 'raio_linear', y: raios, comPiso: true },
    { lei: 'meia_raiz', y: raios, comPiso: true, transformar: Math.sqrt },
  ];
}

/**
 * As leis erradas do raio de um setor de ANEL, em que o furo é o piso: a espessura (ou o raio) em linha
 * com o valor, e a meia correção, em que a raiz fica do lado de fora do raio mínimo e quem sai
 * proporcional ao valor é o quadrado da espessura, não a área do anel.
 */
function leisErradasComFuro(grupo) {
  const espessura = grupo.map((s) => s.raio - s.interno);
  return [
    { lei: 'raio_linear', y: espessura },
    { lei: 'raio_linear', y: grupo.map((s) => s.raio) },
    { lei: 'meia_raiz', y: espessura.map((e) => e * e) },
  ];
}

function medirSetores(grupo, vetores, { tolerancia, furoDeColunaRadial }) {
  const angulo = grupo.map((s) => s.abertura);
  const coroa = grupo.map((s) => s.raio ** 2 - s.interno ** 2);
  const anguloVaria = varia(angulo);
  const coroaVaria = varia(coroa);
  if (grupo.length < 2 || (!anguloVaria && !coroaVaria)) return [];
  const base = { tipo: 'setores', onde: `${grupo.length} setores com centro em (${px(grupo[0].cx)}; ${px(grupo[0].cy)})`, n: grupo.length };
  const semFuro = grupo.every((s) => s.interno === 0);
  // GEO-5: coluna radial codifica por COMPRIMENTO, e o furo de mais da metade do raio é o que a régua
  // manda usar para conter o efeito de área. Nela o raio em linha com o valor é o desenho declarado.
  const colunaRadial = !semFuro && Math.min(...grupo.map((s) => s.interno)) > furoDeColunaRadial * Math.max(...grupo.map((s) => s.raio));
  const erradas = colunaRadial ? [] : semFuro ? leisErradasSemFuro(grupo.map((s) => s.raio)) : leisErradasComFuro(grupo);
  const semLei = { motivo: colunaRadial && coroaVaria ? 'comprimento_radial' : 'valor_nao_casado' };
  // Só o ângulo varia: pizza, rosca, semi rosca. A participação em área é a participação em ângulo.
  if (!coroaVaria) return [{ ...base, ...semLei, ...leiDoGrupo(angulo, [], vetores, tolerancia) }];
  // Só o raio varia: a rosa. A grandeza que tem de acompanhar o valor é a coroa `R² − r²`.
  if (!anguloVaria) return [{ ...base, ...semLei, ...leiDoGrupo(coroa, erradas, vetores, tolerancia, { aceitaPiso: semFuro }) }];
  // Os dois variam. 1: a área inteira segue um valor só.
  const inteiro = leiDoGrupo(grupo.map((_, i) => (angulo[i] * coroa[i]) / 2), [], vetores, tolerancia);
  if (inteiro.lei) return [{ ...base, ...inteiro }];
  // 2: dois canais na mesma marca (`06/05`), o ângulo com um valor e o raio com outro. Quem esta guarda
  // julga é o do raio.
  const doRaio = leiDoGrupo(coroa, erradas, vetores, tolerancia, { aceitaPiso: semFuro });
  if (doRaio.lei) return [{ ...base, onde: `${base.onde}, canal do raio`, ...doRaio }];
  // 3: anéis concêntricos (sunburst, dois períodos). Dentro de cada anel o raio é um só e quem carrega
  // o valor é o ângulo; entre anéis a comparação de área é a GEO-5, que não é desta guarda.
  const aneis = aneisDe(grupo).filter((anel) => anel.length >= 2 && varia(anel.map((s) => s.abertura)));
  if (aneis.length >= 1 && aneis.length < grupo.length) {
    const porAnel = aneis.map((anel) => ({
      tipo: 'setores',
      onde: `${anel.length} setores do anel de ${px(anel[0].interno)} a ${px(anel[0].raio)} px com centro em (${px(anel[0].cx)}; ${px(anel[0].cy)})`,
      n: anel.length,
      motivo: 'valor_nao_casado',
      ...leiDoGrupo(anel.map((s) => s.abertura), [], vetores, tolerancia),
    }));
    if (porAnel.some((r) => r.lei)) return porAnel;
  }
  return [{ ...base, ...semLei, ...inteiro }];
}

/** Até quantos círculos de legenda se tiram de uma ponta do documento para o grupo casar. */
const TETO_DE_LEGENDA = 3;

/**
 * As bolhas de um `<svg>`. Se o grupo inteiro não casa, tenta sem os primeiros ou sem os últimos
 * círculos do documento: a régua de tamanho (ROT-5b) e a amostra de legenda são círculos da mesma cor
 * no mesmo `<svg>`, com valor de referência que não está no `data.ts` (`09/09 v1`, `12/08 v3`).
 */
function medirBolhas(circulos, vetores, tolerancia, onde) {
  const tentar = (lista, rotulo) => {
    const raios = lista.map((c) => c.r);
    if (lista.length < 2 || !varia(raios)) return null;
    return { tipo: 'bolhas', onde: rotulo, n: lista.length, motivo: 'valor_nao_casado', ...leiDoGrupo(raios.map((r) => r * r), leisErradasSemFuro(raios), vetores, tolerancia, { aceitaPiso: true }) };
  };
  const inteiro = tentar(circulos, onde);
  if (!inteiro || inteiro.lei) return inteiro;
  for (let k = 1; k <= TETO_DE_LEGENDA && circulos.length - k >= 3; k += 1) {
    for (const [lista, ponta] of [[circulos.slice(0, -k), 'último(s)'], [circulos.slice(k), 'primeiro(s)']]) {
      const semLegenda = tentar(lista, `${onde}, sem o(s) ${k} ${ponta} do documento, lido(s) como legenda`);
      if (semLegenda?.lei) return semLegenda;
    }
  }
  return inteiro;
}

/**
 * Mede cada grupo de marcas contra os vetores do dado e devolve `{ grupos }`, um por grupo que tem
 * variação a comparar: `{ tipo, onde, n, lei, vetor, desvio, pior, motivo }`.
 *
 * `lei` é `area` (a área é proporcional ao valor), `area_com_piso` (marca sem furo com área afim e
 * piso não negativo, que a GEO-3 aceita: "área em px² com piso e teto declarados"), `raio_linear` ou
 * `meia_raiz` (as duas formas erradas da GEO-3), ou `null` quando nenhum vetor do dado explica o grupo,
 * e aí `motivo` diz por quê: `valor_nao_casado` ou `comprimento_radial`.
 * `desvio` é em pontos percentuais de participação: o da lei certa quando ela cabe, o ESTRAGO da lei
 * errada quando é ela que cabe.
 *
 * Três famílias de grupo: os SETORES de mesmo centro; os DISCOS, um por pizza ou rosca inteira, quando
 * a peça desenha várias de raio diferente (`06/06`); e as BOLHAS de um mesmo `<svg>`, juntas e, se
 * juntas não casam, por cor.
 *
 * `opcoes` traz os dois números que são da guarda e não deste leitor: `tolerancia`, em pontos
 * percentuais, e `furoDeColunaRadial`, a fração do raio de fora a partir da qual o furo faz do grupo
 * uma coluna radial.
 */
export function medirAreaContraValor({ setores, circulos }, vetores, opcoes) {
  const { tolerancia } = opcoes;
  const grupos = [];
  const discos = [];
  for (const grupo of agruparSetores(setores)) {
    grupos.push(...medirSetores(grupo, vetores, opcoes));
    const volta = soma(grupo.map((s) => s.abertura));
    if (aneisDe(grupo).length === 1 && Math.abs(volta - 2 * Math.PI) < 0.02) discos.push(grupo[0]);
  }
  // Os discos moram cada um no seu `<svg>`: o raio entra já com o fator de escala do dele.
  const naTela = discos.map((d) => ({ raio: d.raio * Math.sqrt(d.fator ?? 1), interno: d.interno * Math.sqrt(d.fator ?? 1) }));
  if (naTela.length >= 2 && varia(naTela.map((d) => d.raio))) {
    const semFuro = naTela.every((d) => d.interno === 0);
    const erradas = semFuro ? leisErradasSemFuro(naTela.map((d) => d.raio)) : leisErradasComFuro(naTela);
    const lei = leiDoGrupo(naTela.map((d) => d.raio ** 2 - d.interno ** 2), erradas, vetores, tolerancia);
    grupos.push({ tipo: 'discos', onde: `${naTela.length} discos de raio diferente (uma pizza ou rosca inteira cada)`, n: naTela.length, motivo: 'valor_nao_casado', ...lei });
  }
  const porEscopo = new Map();
  for (const c of circulos) porEscopo.set(c.escopo, [...(porEscopo.get(c.escopo) ?? []), c]);
  for (const lista of porEscopo.values()) {
    const juntas = medirBolhas(lista, vetores, tolerancia, `${lista.length} círculos`);
    if (!juntas) continue;
    if (juntas.lei) {
      grupos.push(juntas);
      continue;
    }
    const porCor = new Map();
    for (const c of lista) porCor.set(c.cor, [...(porCor.get(c.cor) ?? []), c]);
    const separadas = porCor.size > 1 ? [...porCor].map(([cor, cs]) => medirBolhas(cs, vetores, tolerancia, `${cs.length} círculos de cor ${cor}`)).filter((r) => r?.lei) : [];
    grupos.push(...(separadas.length ? separadas : [juntas]));
  }
  return { grupos };
}

