/**
 * Leitor de geometria do `preview.svg`: as marcas de barra e os rótulos de texto, com a coordenada
 * já resolvida. Existe para a guarda ESPESSURA-MARCA (ESP-2) de `guardas.mjs` e não decide nada.
 *
 * POR QUE O SVG, E NÃO O Chart.tsx. Se o rótulo fica dentro ou fora da marca depende do SINAL da
 * largura em tempo de execução: o mesmo código é "fora" numa barra que cresce para a esquerda e
 * "dentro" numa que cresce para a direita. Análise estática acusaria em falso as quatro versões de
 * `02/07`, que ancoram fora com `textAnchor="end"`. O SVG traz `x`, `y`, `width` e `height` de cada
 * marca e `x`, `y`, `font-size` e `text-anchor` de cada texto, já resolvidos pelo navegador.
 *
 * O QUE ESTE LEITOR RESOLVE, medido no acervo em 2026-09-17:
 *   1. ESCOPO. Cada gráfico Recharts sai num `<svg>` aninhado com `viewBox="0 0 w h"` próprio e
 *      `x`/`y` na moldura. Versão com dois gráficos (`02/02 v4`, `02/07 v2`) põe os dois em
 *      coordenadas que começam em zero, então um rótulo do gráfico A cai geometricamente dentro de
 *      uma marca do gráfico B. Marca e texto só se cruzam dentro do MESMO `<svg>`.
 *   2. SÉRIE. Confirmado no arquivo: o Recharts 3 serializa o `LabelList` FORA do
 *      `<g id="recharts-bar-:rN:">`, num grupo irmão de rótulos, então exigir o mesmo grupo de série
 *      deixaria a guarda cega em todas as versões. O `<svg>` aninhado é o escopo equivalente que o
 *      acervo oferece, e é ele que resolve o falso positivo dos dois gráficos.
 *   3. PORCENTAGEM. `02/08` desenha à mão com `width="2.14%"`, resolvido contra o `viewBox` do
 *      ancestral.
 *   4. LARGURA NEGATIVA. `02/07` sai como `<path width="-30.76" x="358">`: a marca vai de `x + w` a
 *      `x`, e o retângulo é normalizado antes de qualquer comparação.
 *   5. `<rect></rect>` COM TAG DE FECHO. O serializador fecha o que o SVG deixaria vazio; fechar
 *      pela pilha inteira zeraria o escopo de tudo o que vem depois.
 *   6. MARCA CONTRA MOLDURA. O que o componente desenha carrega `style="fill:…"` (estilo computado);
 *      a moldura da ferramenta sai com `fill="…"` em atributo. Só o primeiro é marca.
 *   7. HTML. `foreignObject` guarda HTML, invisível aqui: a barra de `01_cards-e-kpis` é um `<div>`
 *      com `background-color`. O leitor sinaliza `htmlMark` para a guarda dizer NÃO MEDIDA.
 */

const TAG = /<(\/?)([a-zA-Z][a-zA-Z0-9:-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;
const ATTR = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*"([^"]*)"/g;
/** Subárvores que definem, não desenham. O ladrilho 4×4 de hachura de `01/03 v3` mora aqui. */
const NAO_DESENHA = new Set(['defs', 'clipPath', 'pattern', 'mask', 'marker', 'symbol']);
/** Acima disto a "marca" é moldura do cartão ou faixa de fundo, não barra. */
const FRACAO_MAXIMA_DA_TELA = 0.25;
/** Barra HTML: `<div>` com cor de fundo, baixo e mais largo que alto (o quadrado é amostra de legenda). */
const ALTURA_MAXIMA_DE_BARRA_HTML = 24;

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

/** Número de atributo SVG; `%` resolve contra a medida do `<svg>` ancestral. */
function medida(valor, base) {
  if (valor === undefined || valor === null) return null;
  const texto = String(valor).trim();
  if (texto.endsWith('%')) {
    const pct = Number.parseFloat(texto);
    return Number.isFinite(pct) && Number.isFinite(base) ? (pct / 100) * base : null;
  }
  const n = Number.parseFloat(texto);
  return Number.isFinite(n) ? n : null;
}

/**
 * Devolve `{ marcas, textos, htmlMark, temTransform }`.
 * `marcas`: `{ escopo, serie, x0, x1, y0, y1, w, h }` com o retângulo já normalizado.
 * `textos`: `{ escopo, texto, x, y, fonte, ancora }`.
 * `temTransform` é a saída de segurança: nenhuma versão do acervo usa `transform`, e sem compor a
 * matriz a comparação geométrica seria mentira, então a guarda não mede quando ele aparece.
 */
export function lerGeometria(conteudo) {
  const svg = conteudo.replace(/<style>[\s\S]*?<\/style>/g, '').replace(/<!--[\s\S]*?-->/g, '');
  const pilha = [];
  const escopos = [];
  const marcas = [];
  const textos = [];
  let temTransform = false;
  let htmlMark = false;
  let aberto = null;
  let fim = 0;
  TAG.lastIndex = 0;
  let m;
  while ((m = TAG.exec(svg))) {
    if (aberto) aberto.texto += svg.slice(fim, m.index);
    fim = TAG.lastIndex;
    const [, fecha, nome, raw, autoFecha] = m;
    if (fecha) {
      if (nome === 'text' && aberto) {
        textos.push(aberto);
        aberto = null;
      }
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
    if (attrs.transform) temTransform = true;
    const pai = pilha[pilha.length - 1] ?? null;
    const no = {
      nome,
      escopo: pai?.escopo ?? -1,
      html: (pai?.html ?? false) || nome === 'foreignObject',
      oculto: (pai?.oculto ?? false) || NAO_DESENHA.has(nome),
      serie: pai?.serie ?? null,
    };
    if (nome === 'g' && /^recharts-bar-/.test(attrs.id ?? '')) no.serie = attrs.id;
    if (nome === 'svg') {
      const vb = (attrs.viewBox ?? '').split(/[\s,]+/).map(Number);
      const ok = vb.length === 4 && vb.every(Number.isFinite);
      escopos.push({ w: ok ? vb[2] : Number(attrs.width), h: ok ? vb[3] : Number(attrs.height) });
      no.escopo = escopos.length - 1;
    }
    const tela = escopos[no.escopo] ?? { w: NaN, h: NaN };
    if (!no.html && !no.oculto && (nome === 'rect' || nome === 'path') && style.fill && style.fill !== 'none') {
      const x = medida(attrs.x, tela.w);
      const y = medida(attrs.y, tela.h);
      const w = medida(attrs.width, tela.w);
      const h = medida(attrs.height, tela.h);
      const area = Math.abs(w) * Math.abs(h);
      if ([x, y, w, h].every((v) => v !== null) && area > 0 && area < FRACAO_MAXIMA_DA_TELA * tela.w * tela.h) {
        marcas.push({ escopo: no.escopo, serie: no.serie, x0: Math.min(x, x + w), x1: Math.max(x, x + w), y0: Math.min(y, y + h), y1: Math.max(y, y + h), w: Math.abs(w), h: Math.abs(h) });
      }
    }
    if (no.html && style['background-color']) {
      const w = medida(style.width, tela.w);
      const h = medida(style.height, tela.h);
      if (w && h && h <= ALTURA_MAXIMA_DE_BARRA_HTML && Math.abs(w - h) > 0.5) htmlMark = true;
    }
    if (!no.html && !no.oculto && nome === 'text' && !autoFecha) {
      aberto = {
        escopo: no.escopo,
        texto: '',
        x: medida(attrs.x, tela.w),
        y: medida(attrs.y, tela.h),
        fonte: Number.parseFloat(style['font-size'] ?? attrs['font-size'] ?? '12'),
        ancora: style['text-anchor'] ?? attrs['text-anchor'] ?? 'start',
      };
    }
    if (!autoFecha) pilha.push(no);
  }
  return { marcas, textos, htmlMark, temTransform };
}
